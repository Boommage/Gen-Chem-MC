# Client Interview Guide

**Project:** _Gen Chem Metacognition_
**Team:** _Team #4_
**Client:** _Heidi Conrad, Chemistry Department, Texas Christian University_
**Meeting:** _Meeting 1_

---

_**What this file is.** Your script going in, your meeting record coming out. Copy it once per meeting into `docs/requirements/` as `client-interview-YYYY-MM-DD.md` and commit it the same day._

_**How to use it.** Each section says what it is for, what it is worth in minutes, and whether it must happen in this meeting. The example questions are written for a different domain (technical recruiting) on purpose, so you cannot use them unchanged. Rewrite them in your client's words before you walk in, and write the answers underneath in **their** words rather than yours._

_**Work it with your agent.** Give it your one-page brief, this file **including these instructions**, and a role: "You are an experienced business analyst preparing for a first client interview. Using the question types in this guide, write the version of each question that fits this client's domain, and list every acronym in the brief you would want defined before the meeting." Then do the part it cannot: pick which of its questions are worth your client's limited hour. **Sort by what it costs you to stay wrong**, not by what is easy to ask. Anything you could answer by reading a document is not worth a client minute._

## Listen before you build

**An idea you propose in the first twenty minutes is not worth what it costs you.** Your strongest instinct will be to show your client you understood by describing what you would build. Early, that ends the elicitation: a client who has heard your idea reacts to it instead of describing their world.

This is about order, not silence. Some clients want to think out loud with you, and a few asked for the project because they want exactly that help. Do it **after** the read-back in section 14, when you can describe their process back to them accurately and the brainstorm is grounded in their world rather than your imagination. If they open by asking for your ideas, say you have some and would rather earn them by understanding the process first, then come back to it before you leave.

**The separate rule is absolute: commit to nothing.** Not a deadline, not a feature, not "sure, we can add that". Five teammates are not in the room. "Let me write that down and bring it back to the team" is the whole sentence, and it holds even when a client pushes.

## Before you go

- [ ] **Three roles assigned.** Lead asks and moves the agenda, one person not four. Scribe writes and does not ask, capturing exact words, especially nouns. Observer watches what is not said: hesitation, the topic they keep returning to, who they defer to.
- [ ] **Everyone has read the client's pitch slides** (TCU Online) and written questions individually before you merged them. The ones two of you wrote independently are the ones to ask.
- [ ] **Shortlist sent to the client the day before.** They arrive with answers instead of promises.
- [ ] **This file open on the scribe's laptop**, with someone on paper as backup.
- [ ] **Someone owns the clock.** You will not get through this guide, and that is expected.

## Meeting record

| | |
|---|---|
| **Date** | _2026-09-11_ |
| **Time and location** | _SWD 203_ |
| **Client participants** | _Heidi Conrad, Client_ |
| **Team participants** | _Amarachi Chiemela, Aria Linganuri, Victor Perez, Sam Shema, DJ Brown, Giang Tran_ |
| **Recording** | _Granted_ |
| **Photos of screens or forms** | _Not Applicable. However, printout summary of research was handed to team._ |

_Ask to record, and say why: so nobody is transcribing instead of listening. If they decline, the scribe matters more. Ask separately about photographing screens, forms, and reports. A photo of the spreadsheet they actually use beats a page of notes about it._

## The shape of the hour

Most first meetings run 60 to 90 minutes. Budget for the short one.

| Part | Sections | 60 min | 90 min |
|---|---|---|---|
| Opening | 1 | 5 | 5 |
| The business | 2, 3 | 10 | 15 |
| The process | 4, 5, 6, 7, 8 | 25 | 40 |
| The boundaries | 9, 10, 11, 12 | 10 | 15 |
| The close | 13, 14, 15 | 10 | 15 |

**Extra time goes into section 4 first.** It repays another ten minutes and it is the only section you cannot reconstruct from notes afterward.

"Can wait" means the next meeting, not never. When you are behind, drop from the middle. **Never drop 14 or 15:** the read-back is where you learn you misunderstood something, and the close is where you stop losing two weeks to scheduling.

---

# Opening

## 1. Get to know your client

_**Must ask. 5 min.** Not small talk. Whose problem is this, how much of the domain lives only in this person's head, and how much of their own time do they have for you? A client fitting this around a full job answers email slowly, and you want to know that in week 3 rather than week 9._

_Adapt: How does this project fit into your work with chemistry students, and what led you to focus on students' study habits and confidence?_
**What they said:**
The client teaches general chemistry and is trying to address a recurring problem among freshmen: many arrive at college without knowing how to study effectively for college-level courses. She has already built and tested a chatbot through PlayLab, but would prefer a new application because PlayLab is nonprofit-hosted and its long-term support is uncertain.
Long term, she would like to pursue an IRB, connect consenting students' usage data with grades, determine whether the intervention improves outcomes, and potentially publish the results.

---

# The business

## 2. Context and domain

_**Must ask. 5 min.** You are here for vocabulary as much as facts. Every term you do not recognize goes in the glossary before you leave. When your client says "cycle" in one sentence and "sprint" in the next, ask which they mean while they are still in front of you; an agent reading the transcript afterward cannot ask._

_Adapt: Can we have access to your research so we can use it to train the model? - How much chemistry do we need to know in order to successfully build the application? - How do chemistry students currently study?_

**What they said:**
The client has lecture videos available on YouTube and plans to provide the team access to course materials on D2L for use in developing/training the model.

The application is not primarily meant to teach chemistry. It needs enough general-chemistry knowledge to evaluate a student's reasoning, but its role is to help the student dissect the question. The client repeatedly emphasized that the chatbot should not perform the breakdown itself or simply provide the answer.

The desired interaction is Socratic: ask what the student knows, what the problem is asking for, what the provided information represents, and how those pieces could fit together. When a student is wrong, the chatbot should prompt reconsideration rather than immediately supplying the correction. When the student reaches the correct reasoning or answer, it may confirm that they are correct.

The client can provide her YouTube lecture videos, D2L course access, and a shared Google Drive containing PowerPoints and course materials. She prefers her own materials as grounding because external resources may teach or simplify concepts differently from her course.

The department also provides tutorial hours staffed by students who earned an A or A- in Chemistry I and II, as well as peer-to-peer tutoring.
 
**Terms for the glossary, in their words:** 
_[
Metacognition: A major desired outcome in which students evaluate how they studied and how those choices related to their performance.
DFW: Drop, fail, withdraw.
IRB: Future research approval connected to studying student
usage and grades.
]_

## 3. Business drivers and objectives

_**Must ask. 5 min.** Why this, why now. These become your business objectives, so push for a number: when they name a benefit, ask the follow-up nobody asks, **what is that number today?**_

_Expect to miss it here. Baselines surface in section 4, when they are looking at the thing that takes the time. Ask the objective now, listen for the number all hour, and close the gap in the read-back._

_Adapt: What is the direct outcome of the app? If someone were to use the app, what would success look like for them? - How is a student meant to gain confidence if they are not being taught the material? - Is this agent primarily for students who transition from high school to college?_

**What they said:**
The central problem is not simply lack of chemistry content. Freshmen often have not yet developed effective college study habits. The client sees students brute-force memorizing, reporting very long study sessions that may not be focused, struggling to break down word problems, and being afraid to admit when they do not know how to study or solve something.

A major desired outcome is self-reflection. The client described a metacognition approach used by another chemistry instructor in which students compared expected and actual grades and reflected on how they studied. The client wants students to recognize their own patterns without feeling judged.

The primary target is freshman students, particularly students adjusting from high school to college-level coursework.

She also wants the system to help students practice working through questions independently. The student needs to do the thinking because they will have to do it themselves on quizzes and exams. Current AI platforms often provide the answer. This application's distinguishing goal is that it should not simply give students the answer. It should guide students toward reaching the answer themselves. The answer should only be confirmed after the student reaches the correct answer.

Eventually, the client would like evidence showing whether using the system correlates with improved grades.

**Candidate objectives (`BO-<slug>`), with baselines where you got them:** _[Or "baseline unknown, `OI-*` raised".]_
BO-STUDY-AWARENESS: Help students identify which study behaviors appear to work for them. Baseline: current habits are largely self-reported.

BO-PROBLEM-DISSECTION: Improve students' ability to break down and reason through problems without being given the solution. Baseline: client reports this is a recurring student difficulty.

BO-FRESHMAN-TRANSITION: Help freshmen develop effective college study habits. Baseline unknown.

BO-SELF-REFLECTION: Support nonjudgmental reflection after studying, quizzes, and exams. Baseline unknown.

BO-OUTCOME-EVIDENCE: Eventually evaluate whether system use is associated with improved grades. Baseline/research design not yet established.

---

# The process

## 4. How it works today

_**Must ask. 10 min, the best ten in the meeting.** Ask them to show you rather than tell you. People describe the process they believe they follow; the spreadsheet shows the one they actually follow, and the gap is where the requirements hide. **"Show me" is the two most productive words in requirements engineering, and they cost nothing.**_

_Walk one real recent case end to end. "Take me through the last one you did" beats "how does it usually work", because the general shape is a summary they have given before and the last real one has the exceptions in it._

_Adapt: Do you currently have any way to determine students' study habits or how they study best? Are those study habits currently self-reported? Have you tried being intentionally wrong with the chatbot to see whether it catches the mistake When you test the chatbot, how long does it usually take before you feel confident in the interaction? How are students currently using the chatbot??_

**What they said:** _
[
1. Students enter general chemistry with different backgrounds, ranging
from one year of high-school chemistry to AP Chemistry to students
repeating the college course.

2. Students attend class and use course materials. In fall, the
client's course is partially flipped; she described roughly 90
modules, with about 30 completed outside class through videos.

3. Students use different study methods, but their habits are currently
largely self-reported.

4. The client encourages timed practice. One example is selecting four
or five random questions and allowing 10 minutes to complete them
before a 12-minute quiz. The purpose is to practice time pressure,
discover safe shortcuts, and experience/manage anxiety before the
real assessment.

5. Students take quizzes and exams.

6. The current chatbot was originally designed largely for reflection
after assessments, but it can also guide students through questions.

7. The chatbot asks students what they know and what the problem is
asking, then continues prompting them to build the solution
themselves.

8. Students can also seek help through office hours, department
tutorial hours, and peer-to-peer tutoring.

9. The client currently lacks objective tracking of how students
actually study and would like a future system to capture more of
this behavior.
]_

**Artifacts they showed/ offered to us:** _[
Existing PlayLab chatbot

YouTube lecture videos

D2L course shell

Shared Google Drive with PowerPoints/course materials

Student-feedback/"Bounce Back" material developed from
interviews/tutoring experiences

Metacognition/reflection resources

Introductions to tutorial students/TAs who can describe common
student difficulties
]_

## 5. What is hard about it

_**Must ask. 5 min.** The complaint is usually the requirement. Listen for "must", "unless", "only", and "except", which arrive unannounced in the middle of a story about something else. Those sentences are business rules, and they exist whether or not your software does._

_Adapt: What issues are students bringing to tutors/tutorial students that we could try to solve? Do students prefer encouragement and conversational support, or do they prefer the chatbot to get straight to the point? Would different modes make sense---for example, a supportive tutor mode and a quicker mode before an exam? How do we identify study habits without relying only on self-reporting?_

**What they said:**
Students struggle to break down word problems and often try to memorize instead of reason. Study habits are largely self-reported, so it is difficult to know what students actually did.

Students may also fear judgment. The client described office hours becoming crowded enough that some students feel overwhelmed and leave rather than ask for help.

There is also a balance between helping freshmen and preserving their agency. They may be accustomed to being micromanaged in high school, but college requires them to take responsibility for their own learning.

The current chatbot can be overly encouraging/verbose for some users. The client personally prefers direct responses but acknowledged that other students may benefit from encouragement.

**Rules heard (candidate `BR-*` for week 4):** _[
BR-STUDENT-DOES-BREAKDOWN: The student must perform the problem
breakdown.

BR-NO-DIRECT-SOLUTION: The chatbot should not solve the problem
for the student from the start.

BR-GUIDED-REASONING: The chatbot should guide through questions
based on the student's own reasoning.

BR-ERROR-REFLECTION: Incorrect reasoning should trigger prompts to
reconsider rather than immediate correction.

BR-CORRECTNESS-CONFIRMATION: The chatbot may confirm correct
reasoning/answers.

BR-GEN-CHEM-KNOWLEDGE: The initial chatbot needs enough Gen Chem
knowledge to evaluate reasoning without becoming the student's
content instructor.

BR-NONJUDGMENTAL: The experience should feel safe and
nonjudgmental.

BR-STUDY-COACH: The client wants a study coach/process tool, not
an AI-generated content-specific exam study guide.
]_

## 6. What already works

_**Must ask. 3 min.** Ask what is good before you propose replacing it. A team that removes something the client liked has lost trust it will not get back this semester, and nobody volunteers this unasked._

_Adapt: What feedback have you received from students who have already tried the chatbot? Have students found any existing study strategies particularly helpful? What existing tutoring or student-support resources are already available?_

**What they said:** _[The client likes that the current chatbot refuses brute-force requests for answers, asks students to identify what they know, catches inconsistencies, and confirms correct reasoning.

A small number of current students have already given positive feedback. One student found the suggestion to review notes immediately after class useful. Another student, who was repeating the course after previously dropping it, reported that timed practice helped her finish a quiz with extra time.

Existing human support such as tutorial hours and peer-to-peer tutoring is also valuable and should not be treated as something the app replaces.]_

## 7. Volumes and scale

_**Must ask. 3 min.** These numbers decide most of your architecture, and they are cheap to ask for and expensive to guess. Twenty records a semester and two hundred thousand a day are different systems._

_Adapt: About how many students are in the class? For starters, should we tailor this to your classes and students, the chemistry department, or a broader group? Long term, do you want this to be usable outside chemistry?_

**What they said:** _[Current class: approximately 185 students.

Department tutorial availability: more than 30 hours.

Fall course: roughly 90 modules, about 30 completed outside
class.

Long-term audience: potentially students across courses, not just
one chemistry class.

Concurrent usage, data volume, and retention requirements were not
established.]_

## 8. Who the users are

_**Must ask. 4 min.** The person who commissions software is often not the person who uses it._

_**If you cannot reach the real users, that is a project risk, not a scheduling detail.** Record it as an `RI-<slug>` the same day. Building from a proxy's account is the most common way a capstone ships something nobody uses, and it is survivable only if you know you are doing it._

_Adapt: Do you want this agent to be specific to freshmen or students transitioning from high school? For starters, do you want us to tailor it to your classes/students or the general chemistry department? Could we talk to the tutorial students/TAs about the questions and problems students bring to them?_

**What they said:**
The best initial target is freshmen, especially students transitioning from high school who have not yet learned how to study effectively in college.

For the first release, the client is comfortable starting with her own students/classes if that is easiest. The long-term goal is broader use across courses.

**Can we reach real users? If not, why, and what is the risk:**
The client offered to connect the team with tutorial students/TAs so the team can ask what questions and problems students commonly bring to them. The exact permission/testing process still needs to be established.
---

# The boundaries

## 9. Constraints and rules

_**Must ask. 4 min.** Nobody asks these in meeting 1 and everybody regrets it in November. A constraint restricts how you may build, and it is a requirement even though it describes no behavior. Ask directly; clients do not volunteer these, they assume you know._

_Adapt: Do you want the chatbot to give the actual answer, or help the
student get there? Should it tell students when they have reached the correct answer? Do you want the chatbot to break the question down, or help the student break it down themselves? Would you want students to have the option to use it anonymously or not? Would you consider bonus points or extra credit to encourage students to use the app??_

**What they said:**
The strongest boundary is that this must not become another AI tool that gives students the answer. The client described this as a "hard stop difference."

The chatbot needs enough subject knowledge to evaluate reasoning, but it should not replace course instruction or generate exam-specific content based on assumptions about what the professor will test.

Privacy and nonjudgmental use matter. The client would like identifiable data, with permission, for future grade correlation/research, but also raised the possibility of allowing anonymous use.

The client may be able to offer extra credit/bonus points to encourage adoption, but departmental approval would be required.

## 10. External dependencies

_**Must ask. 3 min.** What your system has to talk to. Access credentials take weeks to obtain, so the ask has to happen now._

_Adapt: Could we have access to your D2L course? Could we have access to the Google Drive/course materials? Could D2L be linked to the app so we can eventually connect study behavior with grades? If the app tracks assignments or sends reminders, how would it stay synchronized when the course schedule changes?

**What they said:**

D2L is a potential dependency for course information and possibly grades. The client can add the team to her course shell and share her Google Drive resources.

If schedule/assignment reminders are implemented, the schedule must remain current. The client noted that course schedules can change, including because of weather/ice days.

The current prototype depends on PlayLab, whose long-term support is uncertain.
OI-D2L-INTEGRATION: What D2L APIs/data can be accessed and what approvals are required?

OI-GRADE-ACCESS: How can grades be accessed with appropriate permission?

OI-RESEARCH-APPROVAL: What IRB/privacy requirements apply to correlating usage with grades?

OI-HOSTING: What platform and budget will support the application long term?

## 11. Lifetime and who maintains it

_**Must ask. 2 min.** The question students never ask and every client can answer. **Who runs this after we graduate, and what do they already know how to run?** It constrains your entire technology choice, so ask before you pick a stack rather than after._

_Adapt: Would you prefer us to build onto the existing PlayLab app or build something new using it as a basis?_

**What they said:**
The client wants a new application partly because she does not want the project permanently dependent on PlayLab. Her long-term goal is a system usable beyond her course and potentially suitable for formal research/publication.

The post-graduation maintainer, hosting owner, supported technology stack, and funding were not established.
OI-MAINTENANCE: Identify who owns and maintains the application after the team graduates.

## 12. Other stakeholders

_**If there is time. 1 min.** Cheap, and occasionally it turns out somebody with a veto has not been consulted._

_Adapt: Who else could influence this, or be affected by it? Whose approval do we need? Anyone who would rather this project did not happen?_

**What they said:**

---

# The close

## 13. Anything else

_**Must ask. 1 min.** Ask it, then stop talking and wait through the silence. Highest-yield question in the guide, and it only works if you do not fill the pause._

_Adapt: Would a study plan be useful if it focused on study habits and scheduling rather than course-specific content? Do you want the agent to help students track larger responsibilities such as upcoming quizzes, classes, or assignments? What other study methods could we integrate besides Pomodoro? Do you think the app should have a built-in timer? Is the app also meant to serve as a study-logging tool?_

**What they said:**
The client prefers a new application based on the existing chatbot concept.

She wants a coach, not a content-specific study-guide generator, and eventually wants the approach to work for any class.

She responded positively to the idea of different interaction modes (for example, supportive versus concise), integrated Pomodoro/study tracking, summaries of study behavior, and reminders, while emphasizing that students should retain agency.

## 14. The read-back

_**Never skip. 5 min.** The part teams cut when they run late, and the highest-value five minutes of the hour. Say what you understood in your own words and watch for the correction. A client who is nodding may be being polite; a client correcting you is engaged, and that correction is usually the single most useful sentence of the meeting._

_Read back four things: the problem in one sentence, the objectives with any numbers you got, the top three things you heard are hard, and one thing you believe is **out** of scope. The last produces more correction than the other three together._

_Fill in the [vision-and-scope.md](vision-and-scope.md) vision statement table during the meeting, read its six rows aloud, and see what they fix. Ninety seconds._

**What we read back, and what they corrected:** _[The team explicitly clarified an apparent contradiction: the chatbot is  not supposed to teach content, but it must know enough content to guide and evaluate the student's reasoning.

The team summarized the desired interaction as: the student types their process for breaking down the question; the chatbot prompts them to go further; the student continues until they construct the solution; then the chatbot confirms correctness or prompts more work. The client called this the "perfect description."

Current scope interpretation:

Problem: Freshmen often lack effective college study habits and problem-dissection skills.

Objectives: Improve self-reflection, study awareness, reasoning, and eventually measurable academic outcomes.

Top difficulties: self-reported study behavior, fear of judgment/asking for help, and AI systems that provide answers instead of developing reasoning.

Out of scope: replacing course instruction or simply solving chemistry questions for students.]_

## 15. Before you leave the room

_**Never skip. 4 min.** Unglamorous, and where teams lose two weeks._

- [ ] **Next meeting on the calendar** before anyone stands up. Not "we will be in touch". _[Date, time, place:]_
- [ ] **Cadence agreed:** how often, roughly how long, and in person or remote. This course expects meetings **in person, on campus** where your client can travel; if they are outside DFW, agree the tool and who sends the link. _[Cadence:]_
- [ ] **Contact channel and how fast they reply.** _[Channel, turnaround:]_
- [ ] **Who to contact between meetings**, including when this person is away. _[Name, contact:]_
- [ ] **Copies requested** of every artifact you were shown. _[What, and who is sending it:]_
- [ ] **Introductions requested** to anyone named in sections 8 and 12. _[Who:]_
- [ ] **Say what happens next**, in one sentence, so they know what to expect and when.

---

# After the meeting

_File everything within 24 hours, while you still remember why each answer mattered. This file is a record, not a home._

| Section | Feeds |
|---|---|
| 1, 2 | [project-glossary.md](project-glossary.md), and Background in [vision-and-scope.md](vision-and-scope.md) |
| 3 | Business Opportunity, Objectives, and Success Metrics in [vision-and-scope.md](vision-and-scope.md) |
| 4, 6 | Background and the process flow in [vision-and-scope.md](vision-and-scope.md); use cases in week 4 |
| 5 | Business rules catalog, week 4 |
| 7, 9, 10 | Quality attributes, constraints, and external interfaces in the specification, week 4 |
| 8, 12 | Stakeholder Profiles in [vision-and-scope.md](vision-and-scope.md) |
| 8, 11 | Risks (`RI-<slug>`) and assumptions (`AS-<slug>`) in [vision-and-scope.md](vision-and-scope.md) |
| 14 | Scope and the vision statement in [vision-and-scope.md](vision-and-scope.md) |
| Anything unanswered | [OPEN-ISSUES.md](OPEN-ISSUES.md) |

## Initial ideas

_[Solutions anyone floated, yours or theirs. Record them here and nowhere else yet. A solution the client already picked ("then I select the state from a drop-down") is not a requirement, and writing it into the specification makes a design decision on their behalf. Ask why until you reach the need underneath, then write down the need.]_
Guided/Socratic chatbot as the primary feature.

Supportive versus concise chatbot modes.

Benchmark quiz covering existing study habits/preferences.

Built-in Pomodoro timer.

Automatic logging of study time performed inside the app.

Manual logging of other study methods.

Periodic summaries connecting study behavior with grade trends.

D2L/grade integration, subject to access/privacy/consent.

Assignment/schedule tracking.

Course-aware study reminders.

An updateable schedule source so reminders do not become stale.

Cross-course study coaching.

Optional anonymous versus identified use.

Gamification ideas from the team's written notes: streaks, points, and a professor-visible leaderboard.

Possible bonus/extra-credit incentives, subject to department approval.

Scrolling-style interface from the team's earlier brainstorming.

Research the Pulse app/D2L integration approach.

Safety/escalation behavior: the current prototype detected language suggesting possible distress and privately alerted its creator. Whether a new app should reproduce this behavior requires explicit requirements, privacy, and institutional-policy discussion.

## Disagreements and hesitations

_[The observer's section, and the one that evaporates fastest. Two participants using the same word differently. A question answered by the wrong person. A topic they returned to three times. An answer that changed between the start and the end. A visible pause before "yes". None of it is evidence on its own; all of it tells you where to look next.]_
Anonymity vs. research: the client wants a safe, possibly anonymous experience but also wants consenting identifiable data for future grade correlation.

Support vs. agency: reminders/planning may help freshmen, but the system should not micromanage them.

Encouragement vs. directness: different students may prefer different interaction styles.

Study plan vs. study guide: the client is more comfortable coaching study patterns/timetables than generating content-specific exam study guides.

Initial audience: broad long-term vision, but starting with the client's class is acceptable if easiest.

Prototype vs. new app: preserve useful behavior from the prototype but build a more sustainable independent application.

Adoption: only a small group has tried the current chatbot; the client plans to promote/demonstrate it more after the first exam.

## Open questions

_[Everything you could not answer, and everything they answered with "I would have to check". Copy each into [OPEN-ISSUES.md](OPEN-ISSUES.md) as an `OI-*` with the person who can answer it, then sort them before the next meeting by what it costs you to stay wrong.]_
OI-SUCCESS-METRICS: What quantitative result defines success for release 1?

OI-BASELINE-DATA: What baseline grade/study/DFW/confidence data already exists?

OI-INITIAL-AUDIENCE: Client's class, multiple chemistry sections, or broader freshmen?

OI-REAL-USER-TESTING: Which students/TAs can participate and what permissions are needed?

OI-D2L-INTEGRATION: What D2L integration is technically/institutionally permitted?

OI-GRADE-ACCESS: Can grades be retrieved, and under what consent model?

OI-PRIVACY: What data may be stored, viewed, and retained?

OI-ANONYMITY: How would anonymous use coexist with optional grade/research linkage?

OI-IRB: When would IRB approval become necessary?

OI-AI-GUARDRAILS: Precisely when may the bot confirm information versus continue prompting?

OI-SAFETY-ESCALATION: Should distress language trigger alerts, and if so, to whom and under what policy?

OI-MODES: Should users choose supportive versus concise modes?

OI-STUDY-METHODS: Which methods besides Pomodoro/timed practice should be supported?

OI-LOGGING: Which behaviors can be captured automatically versus self-reported?

OI-GRADE-ANALYSIS: How should study/grade relationships be described without implying causation?

OI-SCHEDULE-SOURCE: How will assignment/course schedule changes stay synchronized?

OI-ADOPTION: How will use be encouraged, and can extra credit be approved?

OI-GAMIFICATION: Should streaks/points/leaderboards exist and what behavior should they reinforce?
---

_**Within 24 hours**, send the client your notes and the open questions. It creates the record and gives them a second chance to correct you while the meeting is fresh. Then commit this file._
