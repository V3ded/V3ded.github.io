---
layout: post
title: "Certified Red Team Operator (CRTO) Course Review"
subtitle: "Certified Red Team Operator (CRTO) Course Review"
date: 2020-09-10
author: V3ded
category: Misc
tags: blog
finished: true
excerpt_separator: <!--more-->
---

<blockquote style="background:rgba(219, 32, 225, 0.06); border-left:3px solid rgba(255, 0, 0, 0.9)"> 
<p><b><span style="color:red">Update (23.12.2022):</span></b><br>I want to sincerely apologize for any outdated information that may be present in this post. It has been several years since I took the course and much has changed in the interim. Please use this post as a reference only and be aware that the information contained within is mostly no longer accurate.</p>
</blockquote>

***

# Preface

The [Red Team Ops (RTO)](https://www.zeropointsecurity.co.uk/red-team-ops){:target="_blank"} course and its corresponding certification, Certified Red Team Operator (CRTO), is relatively new to the security industry. It is developed and maintained by a well known Infosec contributor [RastaMouse](https://twitter.com/_rastamouse){:target="_blank"}. The course teaches you about the basic principles, tools, and techniques that are involved within the red teaming tradecraft, and is aimed towards both red teaming enthusiasts and professionals alike. <!--more--> As of last week (29.08.2020), I have successfully completed this course and finished the exam with enough flags to pass. Being done with the certification, I feel it's only adequate I write about my personal experiences throughout my two month journey.

> Disclaimer: With the course being still in its "early" stages, everything in this review may be a subject to change. This review represents the course in a period from the start of July to the end of August 2020.

<img class="centerImgTiny" src="/img/blog/crto-review/crto-review-01.png">

***

# Table of Contents

<a href="#preface">0. Preface</a><br>

<a href="#rto-requirements">1. RTO Requirements</a><br>

<a style="margin-left: 2rem;" href="#--knowledge">1.1. Knowledge</a><br>

<a style="margin-left: 2rem;" href="#--hardware">1.2. Hardware</a><br>

<a href="#what-to-expect-">2. What to expect ?</a><br>

<a style="margin-left: 2rem;" href="#--rto-course">2.2. RTO Course</a><br>

<a style="margin-left: 2rem;" href="#--rto-exam">2.3. RTO Exam</a><br>

<a href="#my-thoughts-on-rto">3. My Thoughts On RTO</a><br>

<a style="margin-left: 2rem;" href="#--covenant-vs-cobalt-strike">3.1. Covenant vs Cobalt Strike</a><br>

<a style="margin-left: 4rem;" href="#--covenant">3.1.1. Covenant</a><br>

<a style="margin-left: 4rem;" href="#--cobalt-strike">3.1.2. Cobalt Strike</a><br>

<a style="margin-left: 4rem;" href="#--more-on-covenant">3.1.3. More on Covenant</a><br>

<a style="margin-left: 2rem;" href="#--course-materials--lab-environment">3.2. Course Materials & Lab Environment</a><br>

<a style="margin-left: 4rem;" href="#--course-materials">3.2.1. Course Materials</a><br>

<a style="margin-left: 4rem;" href="#--lab-environment">3.2.2. Lab Environment</a><br>

<a style="margin-left: 4rem;" href="#--misc">3.2.3. Misc</a><br>

<a style="margin-left: 2rem;" href="#--the-exam">3.3. The Exam</a><br>

<a style="margin-left: 4rem;" href="#--exam-preparation">3.3.1. Exam Preparation</a><br>

<a href="#kudos">4. Kudos</a><br>

<a href="#conclusion">5. Conclusion</a><br>

***

# RTO Requirements

### - Knowledge

There are no existing requirements which limit who can and can't enroll into the RTO course. Knowledge-wise it is recommended to have a fair understanding of networking protocols and programming (ideally C#). 

Fear you don't have what it takes but still want to take a crack at the course? Worry not, because as RastaMouse said, "the most successful students are not those with the greater technical knowledge - but those with a passion for learning new skills". And he couldn't be more right. If you feel like this is something you would enjoy, then sign up and see for yourself. Taking risks is a part of life after all :).

### - Hardware

When it comes to hardware, any computer in the standard price range should do the trick. Just make sure you can allocate at least 6GB of RAM and around 200GB of disk space for two virtual machines. The exact configuration can be found below:

<a href="/img/blog/crto-review/crto-review-02.png" target="_blank"><img class="centerImgLarge" src="/img/blog/crto-review/crto-review-02.png"></a>

> Note: The disk space of both VMs adds up to 120GB instead of 200GB, but I strongly recommend you leave some space for snapshots. Rather safe then sorry.

***

# What To Expect ?

You can find out more about this course on its official page [here](https://www.zeropointsecurity.co.uk/red-team-ops){:target="_blank"}. However with this post being a review, I will try my best to summarize both the course and the exam itself in my own words.

### - RTO Course

RTO is a practical course. With its purchase you get access to a full-fledged Active Directory lab environment for either 30, 60 or 90 days, depending on what you chose when signing up. You also get access to an RTO Slack channel and learning materials in an "e-learn" like format on an online learning platform called Canvas.

<figure>

<a href="/img/blog/crto-review/crto-review-03.png" target="_blank"> <img class="centerImgHuge" src="/img/blog/crto-review/crto-review-03.png"></a>

<figcaption>The Canvas Platform (Image posted with permission from RastaMouse)</figcaption>

</figure>

Now unlike the OSCP and some other training courses, you do **not** receive a PDF. Additionally, it is important to mention that access to Canvas or Slack doesn't expire (whereas your lab access does). You will have lifetime access to the course and its subsequent upgrades without any additional payments.

> Quote from RTO: *RTO is a “rolling course” - which means the materials are never static. As tools, techniques and the threat landscape evolves, so too does RTO. Updates are provided incrementally rather than waiting for “big-bang” v2/v3 releases.*

At the time of writing this, the materials are divided into multiple chapters mostly in written form, with a few videos in between each chapter. The associated chapters are listed below (read from top to bottom, left to right):

<ul style="padding-left: 13%; column-count: 2;"> <!-- style="height:100px; display:flex; flex-direction: column; flex-wrap: wrap; column-count: 6" -->

<li>Introduction to Red Teaming</li>

<li>External Reconnaissance</li>

<li>Initial Compromise</li>

<li>Host Reconnaissance</li>

<li>Persistence</li>

<li>Local Privilege Escalation</li>

<li>Domain Reconnaissance</li>

<li>Credentials & User Impersonation</li>

<li>Password Cracking (added 16/09/2020)</li>

<li>Lateral Movement</li>

<li>Session Passing</li>

<li>SOCKS Proxies</li>

<li>Reverse Port Forwards</li>

<li>DPAPI</li>

<li>Kerberos Abuse</li>

<li>Group Policy Abuse</li>

<li>MS SQL Server Abuse</li>

<li>Domain Dominance</li>

<li>Domain & Forest Trusts</li>

<li>Bypassing Defences</li>

<li> Complete Mission </li>

<li>Wrap Up & Post-Engagement</li>

</ul>

Each chapter consists of multiple sub-chapters which explain the selected topic in more depth. The majority of these chapters also have tasks assigned to them that need to be completed if one wants to earn their final CRTO badge. 

A badge you ask? Yes, a badge. RTO utilizes [Badgr](https://badgr.com/){:target="_blank"} to track one's [progress](https://eu.badgr.com/public/pathway/5e84547c7aa1db408520004a){:target="_blank"}. For every major task you do, you receive a badge. To be considered certified, one needs to collect all the badges including the exam badge (but there is an alternative way, more on that below).

<figure>

<a href="/img/blog/crto-review/crto-review-04.png" target="_blank"> <img class="centerImgLarge" src="/img/blog/crto-review/crto-review-04.png"></a>

<figcaption>CRTO Badgr Pathway</figcaption>

</figure>

As you probably noticed, there are two certification routes. The Internal, and External. Paraphrasing the official webpage: "The Internal Route requires students to take the Red Team Ops course, capture the lab flags and pass the Red Team Ops Exam. As per the target audience for RTO, this is good for those just starting out within information security and are looking to get a taste of some red team tactics. 

The External Route is for those who are already well on their infosec journey and have already earned themselves one or more practical penetration testing certifications. This allows them to have an attempt at the Red Team Ops Exam without having to buy the full course. This is a more cost effective means of gaining the certification if students think they already have what it takes to pass".

### - RTO Exam

The exam follows in the footsteps of other practical certifications like the OSCP and OSCE. The exam consists of a 48 hour red teaming engagement where the end goal is a compromise of a fictional Active Directory network. Important machines have flags associated with them, which need to be captured and submitted to the Canvas panel as a proof of compromise. Contrary to other certifications, the exam results are evaluated immediately by Canvas. You will know whether you passed or failed just minutes after your submission. As of now, three out of four flags are required to pass. No report or other form of proof is needed.

***

# My Thoughts On RTO

Compared to other similar certifications (e.g. PentesterAcademy's [CRTP](https://www.pentesteracademy.com/activedirectorylab){:target="_blank"}), which focus on a more manual approach and Powershell *wizardry*, RTO encourages the usage of C2 frameworks and other common tooling found in almost every red teaming arsenal. I personally enjoyed this approach a lot, as the course teaches you not only Active Directory attacks, but also the basic red teaming mindset.

C2 wise, the course branches out into two separate pathways. One can either use [Covenant](https://github.com/cobbr/Covenant){:target="_blank"} (open-source) or [Cobalt Strike](https://www.cobaltstrike.com/){:target="_blank"} (commercial). The idea behind this is that everyone should have an equal opportunity at completing the course be it an enthusiast or a professional. 

The course also mentions other frameworks (e.g. [PoshC2](https://github.com/nettitude/PoshC2){:target="_blank"} and [SILENTTRINITY](https://github.com/byt3bl33d3r/SILENTTRINITY){:target="_blank"}), however all the demos are done with the previously mentioned ones. That being said, you should be able to apply the knowledge to different frameworks, albeit with a little extra effort.

### - Covenant vs Cobalt Strike

This would probably be one of the most omnipresent questions throughout the Slack channel from the people who start out. I myself have used Covenant v0.5, (commit [`ed4076d81be5d321487c288d71d04f337416b441`](https://github.com/cobbr/Covenant/commit/ed4076d81be5d321487c288d71d04f337416b441){:target="_blank"}) so keep that in mind as my opinion might be a bit biased. To make the bias not as severe, all of the Cobalt Strike points from here on out have been "compiled" from opinions of my good friends who attended the course alongside me. 

So with that, let's get into it.

#### -> Covenant

Pros:

- Open source

- Community support

- If you encounter an issue, then someone probably encountered it before you (easy fixes)

- Constant push of updates & bug fixes

- Easily expandable - add your own tasks, stagers, list goes on

- Neat, modern UI

Cons:

- Still in heavy development

- Grunts (agents) are sometimes unstable (mainly the SMB ones)

- Doesn't play nice with tools like Mimikatz (random crashes, e.g. during Golden Ticket creation)

- Partially Unreliable (Encountered a few random crashes and some commands were broken...)

#### -> Cobalt Strike

Pros:

- More refined than anything else out there (long dev time)

- Easily expandable - custom aggressor scripts

- Getting a trial is possible

- Given proper training it's pretty much point and click

Cons:

- Pricing ($3,500 initially, afterwards $2,500 / year)

- Closed source except for Aggressor scripts (any other modifications violate [ToS](https://doc.lagout.org/operating%20system%20/linux/cobaltstrike/license.pdf){:target="_blank"})

- Harder to troubleshoot if you encounter an issue

> Disclaimer: This whole comparison is heavily **subjective** and asking different people might yield different results. The main goal of this comparison is to give you, the reader, an idea of what tool might be the best for you. By no means am I insulting either of the tools or its creators as I highly respect the work both [Ryan](https://twitter.com/cobbr_io){:target="_blank"} and [Raphael](https://twitter.com/armitagehacker){:target="_blank"} do and have done for the security community.

#### -> More on Covenant

I listed unreliability as one of the main disadvantages in Covenant. Some of you might call me out on that fact, because I used a commit that's a month and a half behind the current master branch. Although I used an older commit, I used one which was the most stable for me depending on what I needed to do in the course. Covenant v0.6 (newest), included a lot of QoL improvements, but also introduced a set of new bugs, such as issues with the `MakeToken` command or staging/stability errors with SMB Grunts (agents). Simply said, I just used a commit which based on **my personal** testing allowed me to complete the course without any *major* hiccups.

With those things in mind, I still encountered issues though. Those issues weren't as severe, however when learning new topics even small problems are enough to make you question yourself. Did you make a mistake? Or was it just a bug? Did you use the correct command? This was and to my knowledge still is by far the biggest pet peeve Covenant users have with the course. Given the nature of RTO, you are learning a lot of new topics. With Covenant being buggy at times, it will make learning harder as you will have to spend time researching and troubleshooting the framework. Guessing whether you are grasping a concept incorrectly or whether Covenant is just misbehaving can sometimes be tiresome. 

While I didn't mind it that much, it took me approximately two weeks to get used to Covenant and its errors. Afterwards, I didn't have any problems because I knew what what worked properly and what didn't. That being said though, I urge you to not give up on this framework and try out Covenant for yourself. Figure out what works and what doesn't work for you, it will pay off one day. Covenant still has a way to go before I'd consider it ideal for red teaming operations, however it is getting there. Slowly, but surely.

> Note: The material did a good job of mentioning different techniques / approaches for certain tasks. Specifically alternative approaches for P2P communication. If SMB grunts or other similar features don't work for you, RastaMouse also mentions different techniques which hopefully will.

### - Course Materials & Lab Environment

I signed up for RTO back in July for a two months of lab time. With few modest breaks in between, it took me approximately one month to finish all the materials and exercises. I spent the remaining 30 days reviewing my notes and preparing myself for the exam. So, how did I like the materials? How was the lab? I'm glad you asked!

#### -> Course Materials

Pros:

- High quality

- Accessibility (log into Canvas anytime, anyplace)

- Syllabus includes all major red teaming topics

- Includes really nice examples, easy to follow with the course

- Lifetime access to materials and future updates

Cons:

- Some of the material can be quite superficial - rather than explaining a concept well you can get a "just do this" approach (e.g. the DPAPI chapter)

- Support is a hit or miss, most of the time it's community driven rather than provider driven (RastaMouse is probably overwhelmed by the amount of requests of he receives - I'd recommend hiring a part-timer to help him)

- The certification is relatively new and not as well known (in my opinion this is subject to change soon though, the course is on a great path)

#### -> Lab Environment

Pros:

- Amazing structure

- Fun

- Realistic

- No downtime in my 60 day lab time period

Cons:

- As of now, hosted locally in the UK - some people outside of Europe (e.g. Brazil, Dubai) reported connection issues

- No cap on machine reboots, silly and frequent reboot requests by silly people (*edit: this has since been capped and therefore is less of an issue, see the next point*)

- "Ghost" reboots that bypass the reboot request page. A lot of them. (*edit: this has been fixed*)

#### -> Misc

Pros:

- Pricing (British Pounds) - £399.00, £599.00 and £649.00 for 30, 60 and 90 days respectively (Internal Route)

- Fun & engaging tasks

- Quick exercise grading (automatic evaluation by Canvas)

- Access to Slack

- Really nice exam environment

Cons:

- Using Covenant will initially consume a lot of your time on troubleshooting and googling for errors

Let me elaborate on few of the supposedly negative things. 

First of all, the learning material. While I did enjoy it a lot, few sections just felt unpolished. They didn't include vital explanations about the given topic, but rather followed an approach of "do that if you want to carry out this attack". It wasn't a problem for me as I was able to google along for more precise explanations (e.g. through [harmj0y's blogs](https://blog.harmj0y.net/){:target="_blank"}), but I could definitely see this being off-putting for someone with less experience than me. Either way, credit is given where credit is due. Even though some of the sections were unpolished, they did leave you with enough general knowledge to go research and expand on the topic on your own.

Next point is the support. It hurts me to say this, because RastaMouse helped me personally and I was satisfied with his responses. However, based on what I talked about with few other people who reached out to me for help, not everyone was as lucky. I mean, in my opinion, it must be really hard to manage a slack channel of 500+ people alone. I see why RastaMouse struggles to keep up. For that reason, I would recommend hiring a part-timer or adding some moderators who can help other students throughout the course if need be. Considering the fact that RTO is a beginner level course, I think it's only appropriate you try to set the students on the right path the best way you can.

Popularity of the certification comes next. It isn't a deciding factor for me, but if you are looking for an HR filter certification, CRTO is not it. It is rather new and for that fact unknown by the wider non-tech audience. Overall, my opinion on this popularity discussion is that you shouldn't choose a certificate because of its name, but because of the personal value it brings you. CRTO has amazing value, but will HR care? At this time, likely not. You need to decide for yourself whether this is or isn't something that hinders your end goal.

Connection issues? Once again, I wasn't affected. But it's hard to miss the occasional complaints people have in the Slack channel. As of now I'm not sure if there is a way to resolve this issue apart from moving closer to the UK where the labs are hosted. Keep that in mind when signing up I guess? The latency *might* make your lab experience unpleasant.

And finally... oh man, the holy grail. Machine reboots and lab reverts. As a student in RTO you get access to a panel that allows you to reboot machines (turn on and off) or vote towards a revert of the lab itself (reset to clean state). As per hacking traditions, the moment you get foothold on a machine you worked so hard for, someone tends to reboot it. Poof, there goes your shell and the whole SMB pivot. Better luck next time! 

Jokes aside, the main reason I had an issue with reboots & reverts was because of how unconstrained they were. When it came to reboots, anyone was able to reboot any machine without any restrictions. This meant that you had a **lot** of people mindlessly rebooting boxes when their exploits didn't work. Probably thinking that if they reset the box for the fifth time, their approach would finally work. Reverts were a beast by itself. For a revert to occur, you needed a vote from five *different* RTO members each. There was a bug though, which allowed anyone to request reverts consecutively, basically casting five votes all by himself. This meant that one individual alone was able to completely revert the lab to its default state. I would say that these shenanigans made me loose 15 hours of progress all-together. Luckily RastaMouse recently put restrictions in place so this won't be much of a problem for you! ~~The issue with reboots remains almost the same though. Smart users are able to "shadow" reboot any machine, totally bypassing the reboot panel. Although still a problem, the frequency of reboots has somewhat decreased.~~


### - The Exam

As previously stated, the exam lasts 48 hours. I managed to complete it in 15 hours, by compromising three out of four flags (passing score). I was initially stuck for the first seven hours due to many silly reasons such as anxiety and fat fingering of my connect-back IP. However after overcoming the first obstacle, getting the three flags was kind of straight forward. Then... The last flag. Even though I knew where it was, I had trouble retrieving it due to Covenant's limitations (refer to *disclaimer* in the Covenant vs Cobalt Strike section please). Believe it or not, I also had a massive headache due to improper time management as I was working for 15 hours straight! Who would have thought? Feeling frustrated and burnt out I accepted the result and submitted my flags, therefore ending the exam. And damn it felt good!

<a href="/img/blog/crto-review/crto-review-05.png" target="_blank"><img class="centerImgSmall2" src="/img/blog/crto-review/crto-review-05.png"></a>

The only downside when it came to the exam was the long booking time which seems to be at an average 1.5+ months at the time of writing. Currently, as of 10th of September, the closest date you can get for the exam is November 25. Luckily the date can be rescheduled an unlimited amount of times so you can choose something closer to your ideal date **if** someone cancels their booking.

#### -> Exam Preparation

After I earned my badge I got a lot questions regarding the exam. The paragraph above would be an ideal answer to most of them, with one exception. *How can you prepare yourself for the exam?* You study the course materials, that's how! The course materials nicely complement the exam. Everything you encounter on your exam is mentioned in the course one way or another. Therefore, if you properly learn your theory and attacks, successfully finishing the exam shouldn't be an issue. I wish you best of luck.

***

# Kudos

Time to slowly wrap this blog up. Let's start with kudos. My thanks goes to all the amazing people I've met throughout the course, mainly Adam, [gh0st](https://www.linkedin.com/in/steve-nyan-lin-b69b43114){:target="_blank"} and Marek. My grattitude also goes to [Jack](https://twitter.com/jack_halon){:target="_blank"} and [Demitech](https://twitter.com/DemitechX){:target="_blank"} for proofreading this blog before its release. Finally, a huge salute goes to RastaMouse for creating the course and the certification. It was a wonderful journey!

***

# Conclusion

With red teaming being one of the prevalent topics of today, I'm glad that there is a course which is so well done and up to date. Eventhough there is room for improvement, I can't deny the fact that this course has taught me a lot. Apart from that, I also found it enjoyable. Therefore, based on my current experience I would rate RTO **7/10**. Although it does well in some regards, it is still rough around the edges. That said, I feel that in due time it will be one of the better certifications on the market, hands down!

Thank you to everyone for reading.

~ V3ded
