slack-4-linux
=============

Slack client for linux. Uses Node Webkit

Running and Developing
======================

####Clone the repo

```
git clone git@github.com:wlaurance/slack-4-linux.git && cd slack-4-linux
```

####Install deps

```
npm install
```

####Build It

```
grunt dist-linux
```

####Run It

```
./run.sh
```

Issues
======
[JBKahn](https://github.com/JBKahn) Pointed out that libudev.so differs on different
machines. If you run into

```
./resources/node-webkit/Linux64/nw: error while loading shared libraries: libudev.so.0: cannot open shared object file: No such file or directory
```

Give [Issue #1](https://github.com/wlaurance/slack-4-linux/issues/1) a look.


TODO
====

* Notifications
* Persistent Logins
* Use the node webkit distribution method when it finally exists



