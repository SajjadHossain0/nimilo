# Mochi Screensaver

Ubuntu 24.04 এবং GNOME 46-এর জন্য offline screensaver। নির্ধারিত সময় mouse/keyboard ব্যবহার না করলে কালো background-এ শুধু animated eyes আসবে। আবার input দিলে আগের desktop দেখা যাবে।

[English README](README.md) · [MIT License](LICENSE)

## প্রথমবার install

1. GitHub-এর **Code → Download ZIP** দিয়ে source নামিয়ে পুরো ZIP extract করো। Git clone করেও source নিতে পারো।
2. যে folder-এ `install.sh`, `mochi.py` ও `extension/` আছে, সেখানে Terminal খোলো।
3. GNOME version এবং installer চালাও:

```bash
gnome-shell --version
bash install.sh
```

এই release-এর জন্য GNOME Shell 46.x লাগবে। Installer-এ sudo লাগে না।

4. কাজ save করে **Log Out → Log In** করো। নতুন/updated extension code load করতে এই ধাপ প্রয়োজন।
5. যাচাই করো:

```bash
gnome-extensions info mochi-screensaver@sajjad.local
```

**Version: 2**, **Enabled: Yes** এবং **State: ACTIVE** দেখো। এরপর ১০-সেকেন্ড test করো:

```bash
~/.local/bin/mochi time 10
```

১৫ সেকেন্ড mouse/keyboard ছুঁবে না। চোখ এলে mouse নড়িয়ে দেখো desktop ফিরে আসে কি না। পরে ৫ মিনিট দাও:

```bash
~/.local/bin/mochi time 300
```

## Configuration বদলানো

| কাজ | Command |
| --- | --- |
| সবসময় সাদা চোখ | `~/.local/bin/mochi color white` |
| ২ মিনিট idle | `~/.local/bin/mochi time 120` |
| ৫ মিনিট idle | `~/.local/bin/mochi time 300` |
| ১০ মিনিট idle | `~/.local/bin/mochi time 600` |
| খুশি চোখ | `~/.local/bin/mochi emotion happy` |
| ঘুমঘুম চোখ | `~/.local/bin/mochi emotion sleepy` |
| Brightness ৮৫ শতাংশ | `~/.local/bin/mochi brightness 85` |
| বন্ধ রাখা | `~/.local/bin/mochi disable` |
| আবার চালু | `~/.local/bin/mochi enable` |
| বর্তমান settings | `~/.local/bin/mochi status` |

- রং: `mint`, `ice`, `white`, `amber`।
- Emotion: `normal`, `happy`, `angry`, `surprised`, `sleepy`, `blinking`, `looking-around`।
- সময় সেকেন্ডে: `10` থেকে `86400`।
- Brightness: `10` থেকে `100`।

Config command একবার দিলেই একই Ubuntu user account-এ restart/logout-এর পরেও মান সেভ থাকে। শুধু settings বদলাতে reinstall বা logout লাগে না। Code update করলে installer চালিয়ে logout/login করতে হবে।

## Default settings ফিরিয়ে আনা

```bash
~/.local/bin/mochi time 300
~/.local/bin/mochi color mint
~/.local/bin/mochi emotion normal
~/.local/bin/mochi brightness 85
```

এরপর সাদা চোখ রাখতে চাইলে `~/.local/bin/mochi color white` চালাও।

## চোখ না এলে

```bash
~/.local/bin/mochi status
journalctl -b --no-pager _COMM=gnome-shell | grep -i mochi | tail -n 40
```

Version 1 থাকলে v2 source install করে logout/login করো। v2-তে GNOME 46 cursor API fix আছে। ACTIVE থাকলেও idle অবস্থায় দেখা যায় কি না পরীক্ষা করতে হবে।

Display blank, lock screen বা অন্য system dialog আগে চলে আসছে কি না দেখো। Power settings তোমার পছন্দ অনুযায়ী রাখো। Installer এগুলো বদলায় না। সত্যিকারের suspend হলে animation চলবে না।

## Compatibility

এই release Ubuntu 24.04-এর GNOME 46 Wayland/Xorg desktop-এর জন্য। অন্য GNOME version, KDE/Xfce, Windows বা macOS-এর compatibility ঘোষণা করা হয়নি। Node.js শুধু developer tests-এর জন্য; ব্যবহার করতে browser, internet বা API key লাগে না।

## Author ও License

**Md. Sajjad Hossain** — Copyright © 2026।

[MIT License](LICENSE) অনুযায়ী source ব্যবহার, পরিবর্তন ও বিতরণ করা যাবে। বিতরণের সময় copyright এবং license notice রাখতে হবে। বিস্তারিত terms `LICENSE` file-এ আছে।
