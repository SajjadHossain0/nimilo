// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Md. Sajjad Hossain
import vm from 'node:vm';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';

const root = fileURLToPath(new URL('../extension/', import.meta.url)).replace(/\/$/, '');
let serial = 1;
const watches = new Map();
const timers = new Map();
const logs = [];
const warnings = [];
const info = [];
let forceCursorError = false;
let cursorLookups = 0;
const Meta = {CursorTracker:{get_for_display(){cursorLookups++; if(forceCursorError)throw new Error('cursor unavailable');return cursor;}}};
let forceGrabState = 3;
let forceGrabError = false;
const monitor = {
    add_idle_watch(interval, callback) { const id = serial++; watches.set(id, {kind:'idle',interval,callback}); return id; },
    add_user_active_watch(callback) { const id = serial++; watches.set(id, {kind:'active',callback}); return id; },
    remove_watch(id) { watches.delete(id); },
};
const cursor = {visible:true, get_pointer_visible() {return this.visible;}, set_pointer_visible(value) {this.visible=value;}};
class Signals {
    constructor() { this.callbacks = new Map(); }
    connect(name, callback) { const id = serial++; this.callbacks.set(id, {name,callback}); return id; }
    disconnect(id) { this.callbacks.delete(id); }
    emit(name, ...args) { for (const handler of this.callbacks.values()) if(handler.name===name) handler.callback(this,...args); }
}
const settings = Object.assign(new Signals(), {
    values:{'idle-seconds':300,emotion:'normal',color:'mint',brightness:85},
    get_uint(key) {return this.values[key];}, get_string(key) {return this.values[key];},
});
class Widget extends Signals {
    constructor(options) {super(); this.options=options; this.children=[]; this.destroyed=false;}
    add_child(child) {this.children.push(child);}
    destroy() {this.destroyed=true; this.children.forEach(child=>child.destroy()); this.callbacks.clear();}
    queue_repaint() {}
}
const Main = {
    sessionMode:Object.assign(new Signals(),{isLocked:false,isGreeter:false}),
    layoutManager:Object.assign(new Signals(),{monitors:[{x:0,y:0,width:1920,height:1080},{x:1920,y:0,width:1280,height:1024}]}),
    uiGroup:new Widget({}), modalCount:0, popped:0,
    pushModal() {if(forceGrabError) throw new Error('grab failed'); Main.modalCount++; return {get_seat_state:()=>forceGrabState};},
    popModal() {Main.modalCount--; Main.popped++;},
};
const Clutter = {FixedLayout:class {},GrabState:{ALL:3},EVENT_STOP:1,EventType:{KEY_PRESS:1,BUTTON_PRESS:2,SCROLL:3,TOUCH_BEGIN:4,MOTION:5}};
const GLib = {PRIORITY_DEFAULT:0,SOURCE_CONTINUE:true,get_monotonic_time:()=>5000000,
    timeout_add(_priority,_interval,callback) {const id=serial++;timers.set(id,callback);return id;},
    Source:{remove(id) {timers.delete(id);}},
};
const context = vm.createContext({console:{error:message=>logs.push(message),warn:message=>warnings.push(message),info:message=>info.push(message)},global:{display:{},backend:{get_core_idle_monitor:()=>monitor},stage:{width:3200,height:1080}}});
const eyeModule = new vm.SourceTextModule(await fs.readFile(`${root}/eyes.js`,'utf8'),{context});
await eyeModule.link(()=>{});await eyeModule.evaluate();
const module = new vm.SourceTextModule(await fs.readFile(`${root}/extension.js`,'utf8'),{context});
const modules = new Map();
function synthetic(key,values) {
    if(!modules.has(key)) modules.set(key,new vm.SyntheticModule(Object.keys(values),function(){for(const [name,value] of Object.entries(values))this.setExport(name,value);},{context}));
    return modules.get(key);
}
await module.link(specifier=> {
    if(specifier==='./eyes.js') return eyeModule;
    if(specifier.endsWith('/main.js')) return synthetic(specifier,Main);
    if(specifier.endsWith('/extension.js')) return synthetic(specifier,{Extension:class {getSettings(){return settings;}}});
    const mocks={'gi://Meta':Meta,'gi://Clutter':Clutter,'gi://GLib':GLib,'gi://Shell':{ActionMode:{SYSTEM_MODAL:1}},'gi://St':{Widget,DrawingArea:Widget}};
    assert.ok(specifier in mocks,`Unexpected import: ${specifier}`);
    return synthetic(specifier,{default:mocks[specifier]});
});
await module.evaluate();
function fire(id) {const watch=watches.get(id);assert.ok(watch);if(watch.kind==='active')watches.delete(id);watch.callback();}
const Extension=module.namespace.default;
const extension=new Extension();
extension.enable();
assert.equal(watches.size,1);assert.equal(watches.get(extension._idleWatch).interval,300000);
fire(extension._idleWatch);
assert.equal(extension._areas.length,2);assert.equal(Main.modalCount,1);assert.equal(timers.size,1);assert.equal(cursor.visible,false);
assert.equal(cursorLookups,1,'GNOME 46 must obtain the cursor tracker through Meta, without the GNOME 48 backend method');
fire(extension._activeWatch);
assert.equal(extension._overlay,null);assert.equal(Main.modalCount,0);assert.equal(timers.size,0);assert.equal(cursor.visible,true);assert.equal(watches.size,1);
fire(extension._idleWatch);
const actor=extension._overlay;
actor.emit('captured-event',{type:()=>Clutter.EventType.KEY_PRESS});
assert.equal(extension._overlay,null);assert.equal(actor.destroyed,true);assert.equal(watches.size,1);assert.equal(Main.modalCount,0);
Main.sessionMode.isLocked=true;fire(extension._idleWatch);assert.equal(extension._overlay,null);Main.sessionMode.isLocked=false;
forceGrabState=1;fire(extension._idleWatch);assert.equal(extension._overlay,null);assert.equal(Main.modalCount,0);assert.equal(watches.size,1);forceGrabState=3;
settings.values['idle-seconds']=10;settings.emit('changed','idle-seconds');assert.equal(watches.size,1);assert.equal(watches.get(extension._idleWatch).interval,10000);
fire(extension._idleWatch);Main.layoutManager.emit('monitors-changed');assert.equal(extension._overlay,null);assert.equal(timers.size,0);
forceCursorError=true;fire(extension._idleWatch);
assert.ok(extension._overlay,'A cosmetic cursor failure must not dismiss the eyes');
assert.equal(Main.modalCount,1);assert.equal(timers.size,1);
assert.ok(warnings.some(message=>message.includes('keeping eyes visible')));
fire(extension._activeWatch);assert.equal(extension._overlay,null);assert.equal(Main.modalCount,0);forceCursorError=false;
fire(extension._idleWatch);
const setVisible=cursor.set_pointer_visible;
cursor.set_pointer_visible=()=>{throw new Error('restore unavailable');};
fire(extension._activeWatch);
assert.equal(extension._overlay,null);assert.equal(Main.modalCount,0);assert.equal(timers.size,0);
cursor.set_pointer_visible=setVisible;cursor.visible=true;
forceGrabError=true;fire(extension._idleWatch);assert.equal(extension._overlay,null);assert.equal(logs.length,1);forceGrabError=false;
fire(extension._idleWatch);extension.disable();assert.equal(watches.size,0);assert.equal(timers.size,0);assert.equal(Main.modalCount,0);assert.equal(cursor.visible,true);
assert.equal(settings.callbacks.size,0);assert.equal(Main.sessionMode.callbacks.size,0);assert.equal(Main.layoutManager.callbacks.size,0);
const {makeFrame,paintEyes,EMOTIONS}=eyeModule.namespace;
let frameCount=0;
for(const mood of EMOTIONS)for(let t=0;t<70;t+=0.03){
    const frame=makeFrame(t,mood);
    for(const key of ['x','y','width','height','radius','blink'])assert.ok(Number.isFinite(frame[key]));
    assert.ok(frame.height>=1.7&&frame.height<=37);assert.ok(frame.blink>=0&&frame.blink<=1);
    assert.ok(40+frame.x-frame.width/2>0);assert.ok(88+frame.x+frame.width/2<128);
    assert.ok(32+frame.y-frame.height/2>0);assert.ok(32+frame.y+frame.height/2<64);
    frameCount++;
}
const cairo=new Proxy({}, {get:()=>()=>{}});
for(const mood of EMOTIONS)paintEyes(cairo,1920,1080,makeFrame(2.5,mood),'mint',85);
console.log(`PASS: ${frameCount} animation frames across seven emotions; idle activation, input dismissal, lock suppression, partial/failed grab cleanup, timeout changes, monitor changes, disable cleanup and Cairo paths.`);
