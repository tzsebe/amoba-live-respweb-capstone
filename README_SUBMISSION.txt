Hello,

I just wanted to call out a few things here:

1) If you can't get this to run, I've also deployed it to Amazon EC2: http://ec2-52-39-124-139.us-west-2.compute.amazonaws.com/

2) This looks and works best in Chrome, and was tested in Chrome, FF, and IE11.

3) The user1 through user 20 accounts all have password 'aaaaaa', but you can also just create your own account.

4) I've tested this on Ubuntu 14.04, and on Windows 7.

5) It works fine on Windows, but the Windows version of meteor likes to download and install packages upfront. If it starts downloading 1.4, and runs out of memory, just kill it and try re-running. It will work eventually.

6) If you try to update to 1.4, it simply won't run in windows (because of bcrypt@0.8.7 being totally broken on Windows 7 64-bit).

Have fun!!!
