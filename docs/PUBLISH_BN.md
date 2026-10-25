# GitHub এ প্রথমবার প্রকাশ করার ধাপ

এই নির্দেশনা project maintainer-এর জন্য। নিচের commands তোমার computer-এ চালালে source তোমার GitHub account-এ public হবে। Package-এ README ও LICENSE আগে থেকেই আছে।

## ১ Project folder খোলো

`mochi-screensaver-github-ready.zip` extract করো। ভেতরের `mochi-screensaver` folder-এ **Open in Terminal** করো। `ls` দিলে README.md, LICENSE, install.sh ও extension দেখা যাবে।

## ২ Git এবং GitHub CLI install করো

আগে থেকে install না থাকলে Ubuntu-তে:

```bash
sudo apt update
sudo apt install git gh
```

## ৩ GitHub account দিয়ে login করো

```bash
gh auth login --hostname github.com --git-protocol https --web
gh auth setup-git
```

Terminal-এ code বা browser-এর নির্দেশনা এলে নিজের browser-এ login সম্পূর্ণ করো। শেষ হলে account যাচাই করো:

```bash
gh auth status
```

## ৪ নিজের নাম এবং commit email সেট করো

প্রথমে repo initialize করো:

```bash
git init -b main
git config user.name "Md. Sajjad Hossain"
git config user.email "YOUR_GITHUB_EMAIL"
```

`YOUR_GITHUB_EMAIL` নিজের GitHub account-এর email দিয়ে বদলাবে। চাইলে GitHub Settings → Emails-এ দেখানো নিজের noreply email ব্যবহার করতে পারো। Placeholder অপরিবর্তিত রেখে command চালাবে না। এই identity শুধু বর্তমান repository-তে প্রযোজ্য।

## ৫ Files commit করো

```bash
git add .
git diff --cached --stat
git commit -m "Initial open source release of Mochi Screensaver"
```

## ৬ Public repository তৈরি করে source push করো

এই ধাপ source সবার দেখার জন্য public করবে। নিজের account-এ `mochi-screensaver` নামে repo আগে থেকে না থাকলে চালাও:

```bash
gh repo create mochi-screensaver --public --source=. --remote=origin --push --description "Offline eyes-only screensaver for Ubuntu 24.04 and GNOME 46"
```

একই নামের repo আগে থেকেই থাকলে এই create command আবার চালাবে না। ওই repo ব্যবহার করবে কি না ঠিক করে তার URL অনুযায়ী remote configure করতে হবে।

## ৭ Browser এ ফলাফল দেখো

```bash
gh repo view --web
```

README preview, source files, Public visibility এবং MIT license দেখো। README image-এর relative link কাজ করছে কি না যাচাই করো।

## পরে পরিবর্তন push করতে

নিজের পরিবর্তনগুলো যাচাই করে:

```bash
git add .
git diff --cached --stat
git commit -m "Describe the change"
git push
```

`Describe the change`-এর বদলে কী বদলেছ তা সংক্ষেপে লিখবে।

## License এবং পরিচয়

`LICENSE`-এ **Copyright (c) 2026 Md. Sajjad Hossain** এবং standard **MIT License** আছে। এটি free/personal/commercial ব্যবহার, modification ও redistribution-এর অনুমতি দেয়; copyright ও permission notice রাখতে হয়। MIT modified version-কে open source রাখার বাধ্যবাধকতা দেয় না।

এই নির্দেশনা source publish করে। GNOME extensions website-এ publish করা আলাদা কাজ; সেই submission এই package দিয়ে করা হয়নি।

## Official references

- https://docs.github.com/en/migrations/importing-source-code/using-the-command-line-to-import-source-code/adding-locally-hosted-code-to-github
- https://cli.github.com/manual/gh_repo_create
- https://cli.github.com/manual/gh_auth_login
- https://opensource.org/license/mit
