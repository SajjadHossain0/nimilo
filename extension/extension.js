// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Md. Sajjad Hossain
import Clutter from 'gi://Clutter';
import GLib from 'gi://GLib';
import Meta from 'gi://Meta';
import Shell from 'gi://Shell';
import St from 'gi://St';
import {Extension} from 'resource:///org/gnome/shell/extensions/extension.js';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import {makeFrame, paintEyes} from './eyes.js';

export default class MochiScreensaver extends Extension {
    enable() {
        this._settings = this.getSettings();
        this._monitor = global.backend.get_core_idle_monitor();
        this._areas = [];
        this._idleWatch = 0;
        this._activeWatch = 0;
        this._timer = 0;
        this._overlay = null;
        this._grab = null;
        this._cursor = null;
        this._settingsId = this._settings.connect('changed', (_settings, key) => {
            if (key === 'idle-seconds') {
                this._hide();
                this._arm();
            } else {
                this._areas.forEach(area => area.queue_repaint());
            }
        });
        this._sessionId = Main.sessionMode.connect('updated', () => this._hide());
        this._monitorsId = Main.layoutManager.connect('monitors-changed', () => this._hide());
        this._arm();
        console.info('Mochi Screensaver v2: enabled');
    }

    _arm() {
        if (this._idleWatch)
            this._monitor.remove_watch(this._idleWatch);
        this._idleWatch = this._monitor.add_idle_watch(this._settings.get_uint('idle-seconds') * 1000, () => this._show());
        console.info(`Mochi Screensaver v2: idle watch armed for ${this._settings.get_uint('idle-seconds')} seconds`);
    }

    _show() {
        if (this._overlay || Main.sessionMode.isLocked || Main.sessionMode.isGreeter || Main.modalCount > 0) {
            console.info('Mochi Screensaver v2: idle reached; display deferred because a lock screen or modal is active');
            return;
        }
        console.info('Mochi Screensaver v2: idle reached; opening eyes');
        try {
            this._overlay = new St.Widget({
                name: 'mochi-screensaver', reactive: true, can_focus: true,
                x: 0, y: 0, width: global.stage.width, height: global.stage.height,
                layout_manager: new Clutter.FixedLayout(),
                style: 'background-color: #000000;',
            });
            this._startTime = GLib.get_monotonic_time();
            this._areas = Main.layoutManager.monitors.map(monitor => {
                const area = new St.DrawingArea({x: monitor.x, y: monitor.y, width: monitor.width, height: monitor.height});
                area.connect('repaint', () => {
                    const cr = area.get_context();
                    try {
                        const [width, height] = area.get_surface_size();
                        const seconds = (GLib.get_monotonic_time() - this._startTime) / 1000000;
                        paintEyes(cr, width, height, makeFrame(seconds, this._settings.get_string('emotion')),
                            this._settings.get_string('color'), this._settings.get_uint('brightness'));
                    } finally {
                        cr.$dispose();
                    }
                });
                this._overlay.add_child(area);
                return area;
            });
            this._overlay.connect('captured-event', (_actor, event) => {
                const type = event.type();
                if ([Clutter.EventType.KEY_PRESS, Clutter.EventType.BUTTON_PRESS, Clutter.EventType.SCROLL,
                    Clutter.EventType.TOUCH_BEGIN, Clutter.EventType.MOTION].includes(type))
                    this._hide();
                return Clutter.EVENT_STOP;
            });
            Main.uiGroup.add_child(this._overlay);
            this._grab = Main.pushModal(this._overlay, {actionMode: Shell.ActionMode.SYSTEM_MODAL});
            if (this._grab.get_seat_state() !== Clutter.GrabState.ALL) {
                console.warn('Mochi Screensaver v2: could not acquire the screen input grab');
                this._hide();
                return;
            }
            // Mutter knows about input in every app, including on Wayland.
            this._activeWatch = this._monitor.add_user_active_watch(() => {
                this._activeWatch = 0; // User-active watches remove themselves after firing.
                this._hide();
            });
            this._hideCursor();
            this._timer = GLib.timeout_add(GLib.PRIORITY_DEFAULT, 33, () => {
                this._areas.forEach(area => area.queue_repaint());
                return GLib.SOURCE_CONTINUE;
            });
        } catch (error) {
            console.error(`Mochi Screensaver v2: ${error}\n${error.stack ?? ''}`);
            this._hide();
        }
    }

    _hideCursor() {
        // GNOME 46/47 expose the tracker on Meta.CursorTracker. The backend
        // method was introduced in GNOME 48. A cosmetic cursor failure must
        // never close the emotion screen or leave a modal input grab behind.
        try {
            const tracker = typeof global.backend.get_cursor_tracker === 'function'
                ? global.backend.get_cursor_tracker()
                : Meta.CursorTracker.get_for_display(global.display);
            if (!tracker || typeof tracker.set_pointer_visible !== 'function')
                return;
            const wasVisible = tracker.get_pointer_visible();
            tracker.set_pointer_visible(false);
            this._cursor = tracker;
            this._cursorWasVisible = wasVisible;
        } catch (error) {
            console.warn(`Mochi Screensaver v2: cursor hiding unavailable; keeping eyes visible: ${error}`);
        }
    }

    _hide() {
        if (this._timer) {
            GLib.Source.remove(this._timer);
            this._timer = 0;
        }
        if (this._activeWatch) {
            this._monitor.remove_watch(this._activeWatch);
            this._activeWatch = 0;
        }
        if (this._grab) {
            Main.popModal(this._grab);
            this._grab = null;
        }
        if (this._cursor) {
            const tracker = this._cursor;
            this._cursor = null;
            try {
                tracker.set_pointer_visible(this._cursorWasVisible);
            } catch (error) {
                console.warn(`Mochi Screensaver v2: cursor restore failed: ${error}`);
            }
        }
        this._overlay?.destroy();
        this._overlay = null;
        this._areas = [];
    }

    disable() {
        this._hide();
        if (this._idleWatch)
            this._monitor.remove_watch(this._idleWatch);
        this._idleWatch = 0;
        if (this._settingsId)
            this._settings.disconnect(this._settingsId);
        if (this._sessionId)
            Main.sessionMode.disconnect(this._sessionId);
        if (this._monitorsId)
            Main.layoutManager.disconnect(this._monitorsId);
        this._settingsId = this._sessionId = this._monitorsId = 0;
        this._settings = this._monitor = null;
    }
}
