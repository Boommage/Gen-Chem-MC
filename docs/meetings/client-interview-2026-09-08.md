# Initial Client Meeting

**Project:** _Gen Chem Metacognition_
**Team:** _Team #4_
**Client:** _Heidi Conrad, Chemistry Department, Texas Christian University_
**Meeting:** _Meeting 1_

---

## Meeting record

| | |
|---|---|
| **Date** | _2026-09-11_ |
| **Time and location** | _SWD 203_ |
| **Client participants** | _Heidi Conrad, Client_ |
| **Team participants** | _Amarachi Chiemela, Aria Linganuri, Victor Perez, Sam Shema, DJ Brown, Giang Tran_ |
| **Recording** | _Granted_ |
| **Photos of screens or forms** | _Not Applicable. However, printout summary of research was handed to team._ |


---

## 1. Get to know your client

_Adapt: How does this project fit into your work with chemistry students, and what led you to focus on students' study habits and confidence?_

**Client Response:**
The client teaches general chemistry and is trying to address a recurring problem among freshmen: many arrive at college without knowing how to study effectively for college-level courses. She has already built and tested a chatbot through PlayLab, but would prefer a new application because PlayLab is nonprofit-hosted and its long-term support is uncertain.
Long term, she would like to pursue an IRB, connect consenting students' usage data with grades, determine whether the intervention improves outcomes, and potentially publish the results.

---

## 2. Context and domain

_Question: Can we have access to your research so we can use it to train the model? - How much chemistry do we need to know in order to successfully build the application? - How do chemistry students currently study?_

**Client Response:**
The client has lecture videos available on YouTube and plans to provide the team access to course materials on D2L for use in developing/training the model.

The application is not primarily meant to teach chemistry. It needs enough general-chemistry knowledge to evaluate a student's reasoning, but its role is to help the student dissect the question. The client repeatedly emphasized that the chatbot should not perform the breakdown itself or simply provide the answer.

The desired interaction is Socratic: ask what the student knows, what the problem is asking for, what the provided information represents, and how those pieces could fit together. When a student is wrong, the chatbot should prompt reconsideration rather than immediately supplying the correction. When the student reaches the correct reasoning or answer, it may confirm that they are correct.

The client can provide her YouTube lecture videos, D2L course access, and a shared Google Drive containing PowerPoints and course materials. She prefers her own materials as grounding because external resources may teach or simplify concepts differently from her course.

The department also provides tutorial hours staffed by students who earned an A or A- in Chemistry I and II, as well as peer-to-peer tutoring.
 
**Terms for the glossary, in their words:** 
Metacognition: A major desired outcome in which students evaluate how they studied and how those choices related to their performance.
DFW: Drop, fail, withdraw.
IRB: Future research approval connected to studying student
usage and grades.

## 3. Business drivers and objectives

_Question: What is the direct outcome of the app? If someone were to use the app, what would success look like for them? - How is a student meant to gain confidence if they are not being taught the material? - Is this agent primarily for students who transition from high school to college?_

*Client response:**
The central problem is not simply lack of chemistry content. Freshmen often have not yet developed effective college study habits. The client sees students brute-force memorizing, reporting very long study sessions that may not be focused, struggling to break down word problems, and being afraid to admit when they do not know how to study or solve something.

A major desired outcome is self-reflection. The client described a metacognition approach used by another chemistry instructor in which students compared expected and actual grades and reflected on how they studied. The client wants students to recognize their own patterns without feeling judged.

The primary target is freshman students, particularly students adjusting from high school to college-level coursework.

She also wants the system to help students practice working through questions independently. The student needs to do the thinking because they will have to do it themselves on quizzes and exams. Current AI platforms often provide the answer. This application's distinguishing goal is that it should not simply give students the answer. It should guide students toward reaching the answer themselves. The answer should only be confirmed after the student reaches the correct answer.

Eventually, the client would like evidence showing whether using the system correlates with improved grades.

BO-STUDY-AWARENESS: Help students identify which study behaviors appear to work for them. Baseline: current habits are largely self-reported.

BO-PROBLEM-DISSECTION: Improve students' ability to break down and reason through problems without being given the solution. Baseline: client reports this is a recurring student difficulty.

BO-FRESHMAN-TRANSITION: Help freshmen develop effective college study habits. Baseline unknown.

BO-SELF-REFLECTION: Support nonjudgmental reflection after studying, quizzes, and exams. Baseline unknown.

BO-OUTCOME-EVIDENCE: Eventually evaluate whether system use is associated with improved grades. Baseline/research design not yet established.

---


## 4. How it works today

_Question: Do you currently have any way to determine students' study habits or how they study best? Are those study habits currently self-reported? Have you tried being intentionally wrong with the chatbot to see whether it catches the mistake When you test the chatbot, how long does it usually take before you feel confident in the interaction? How are students currently using the chatbot??_

**Client Response:** 
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

6. The current chatbot was originally designed largely for reflection after assessments, but it can also guide students through questions.

7. The chatbot asks students what they know and what the problem is asking, then continues prompting them to build the solution themselves.

8. Students can also seek help through office hours, department tutorial hours, and peer-to-peer tutoring.

9. The client currently lacks objective tracking of how students actually study and would like a future system to capture more of this behavior.

**Artifacts they showed/ offered to us:** 
Existing PlayLab chatbot

YouTube lecture videos

D2L course shell

Shared Google Drive with PowerPoints/course materials

Student-feedback/"Bounce Back" material developed from
interviews/tutoring experiences

Metacognition/reflection resources

Introductions to tutorial students/TAs who can describe common
student difficulties


## 5. What is hard about it

_Question: What issues are students bringing to tutors/tutorial students that we could try to solve? Do students prefer encouragement and conversational support, or do they prefer the chatbot to get straight to the point? Would different modes make sense---for example, a supportive tutor mode and a quicker mode before an exam? How do we identify study habits without relying only on self-reporting?_

**Client Response:**
Students struggle to break down word problems and often try to memorize instead of reason. Study habits are largely self-reported, so it is difficult to know what students actually did.

Students may also fear judgment. The client described office hours becoming crowded enough that some students feel overwhelmed and leave rather than ask for help.

There is also a balance between helping freshmen and preserving their agency. They may be accustomed to being micromanaged in high school, but college requires them to take responsibility for their own learning.

The current chatbot can be overly encouraging/verbose for some users. The client personally prefers direct responses but acknowledged that other students may benefit from encouragement.

**Rules heard (candidate `BR-*` for week 4):** 
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


## 6. What already works

_Question: What feedback have you received from students who have already tried the chatbot? Have students found any existing study strategies particularly helpful? What existing tutoring or student-support resources are already available?_

**Client Response:** _[The client likes that the current chatbot refuses brute-force requests for answers, asks students to identify what they know, catches inconsistencies, and confirms correct reasoning.

A small number of current students have already given positive feedback. One student found the suggestion to review notes immediately after class useful. Another student, who was repeating the course after previously dropping it, reported that timed practice helped her finish a quiz with extra time.

Existing human support such as tutorial hours and peer-to-peer tutoring is also valuable and should not be treated as something the app replaces.]_

## 7. Volumes and scale

_Question: About how many students are in the class? For starters, should we tailor this to your classes and students, the chemistry department, or a broader group? Long term, do you want this to be usable outside chemistry?_

**Client Resposne:** 
Current class: approximately 185 students.

Department tutorial availability: more than 30 hours.

Fall course: roughly 90 modules, about 30 completed outside
class.

Long-term audience: potentially students across courses, not just
one chemistry class.

Concurrent usage, data volume, and retention requirements were not
established.

## 8. Who the users are

_Question: Do you want this agent to be specific to freshmen or students transitioning from high school? For starters, do you want us to tailor it to your classes/students or the general chemistry department? Could we talk to the tutorial students/TAs about the questions and problems students bring to them?_

**Client Response:**
The best initial target is freshmen, especially students transitioning from high school who have not yet learned how to study effectively in college.

For the first release, the client is comfortable starting with her own students/classes if that is easiest. The long-term goal is broader use across courses.

**Can we reach real users? If not, why, and what is the risk:**
The client offered to connect the team with tutorial students/TAs so the team can ask what questions and problems students commonly bring to them. The exact permission/testing process still needs to be established.
---

## 9. Constraints and rules


_Question: Do you want the chatbot to give the actual answer, or help the student get there? Should it tell students when they have reached the correct answer? Do you want the chatbot to break the question down, or help the student break it down themselves? Would you want students to have the option to use it anonymously or not? Would you consider bonus points or extra credit to encourage students to use the app??_

**Client Response:**
The strongest boundary is that this must not become another AI tool that gives students the answer. The client described this as a "hard stop difference."

The chatbot needs enough subject knowledge to evaluate reasoning, but it should not replace course instruction or generate exam-specific content based on assumptions about what the professor will test.

Privacy and nonjudgmental use matter. The client would like identifiable data, with permission, for future grade correlation/research, but also raised the possibility of allowing anonymous use.

The client may be able to offer extra credit/bonus points to encourage adoption, but departmental approval would be required.

## 10. External dependencies

_Question: Could we have access to your D2L course? Could we have access to the Google Drive/course materials? Could D2L be linked to the app so we can eventually connect study behavior with grades? If the app tracks assignments or sends reminders, how would it stay synchronized when the course schedule changes?

**Client Response:**

D2L is a potential dependency for course information and possibly grades. The client can add the team to her course shell and share her Google Drive resources.

If schedule/assignment reminders are implemented, the schedule must remain current. The client noted that course schedules can change, including because of weather/ice days.

The current prototype depends on PlayLab, whose long-term support is uncertain.
OI-D2L-INTEGRATION: What D2L APIs/data can be accessed and what approvals are required?

OI-GRADE-ACCESS: How can grades be accessed with appropriate permission?

OI-RESEARCH-APPROVAL: What IRB/privacy requirements apply to correlating usage with grades?

OI-HOSTING: What platform and budget will support the application long term?

## 11. Lifetime and who maintains it

_Question: Would you prefer us to build onto the existing PlayLab app or build something new using it as a basis? What is the long-term goal for this project?_

**Client Response:**
The client wants a new application partly because she does not want the project permanently dependent on PlayLab. Her long-term goal is a system usable beyond her course and potentially suitable for formal research/publication.

The post-graduation maintainer, hosting owner, supported technology stack, and funding were not established.
OI-MAINTENANCE: Identify who owns and maintains the application after the team graduates.

---

# The close

## 13. Anything else

_Question: Would a study plan be useful if it focused on study habits and scheduling rather than course-specific content? Do you want the agent to help students track larger responsibilities such as upcoming quizzes, classes, or assignments? What other study methods could we integrate besides Pomodoro? Do you think the app should have a built-in timer? Is the app also meant to serve as a study-logging tool?_

**Client Response:**
The client prefers a new application based on the existing chatbot concept.

She wants a coach, not a content-specific study-guide generator, and eventually wants the approach to work for any class.

She responded positively to the idea of different interaction modes (for example, supportive versus concise), integrated Pomodoro/study tracking, summaries of study behavior, and reminders, while emphasizing that students should retain agency.

## 14. The read-back

**What we read back, and what they corrected:** 
The team explicitly clarified an apparent contradiction: the chatbot is  not supposed to teach content, but it must know enough content to guide and evaluate the student's reasoning.

The team summarized the desired interaction as: the student types their process for breaking down the question; the chatbot prompts them to go further; the student continues until they construct the solution; then the chatbot confirms correctness or prompts more work. The client called this the "perfect description."

Current scope interpretation:

Problem: Freshmen often lack effective college study habits and problem-dissection skills.

Objectives: Improve self-reflection, study awareness, reasoning, and eventually measurable academic outcomes.

Top difficulties: self-reported study behavior, fear of judgment/asking for help, and AI systems that provide answers instead of developing reasoning.

Out of scope: replacing course instruction or simply solving chemistry questions for students.

## 15. Before you leave the room

- [ ] **Next meeting on the calendar** _09/15/206, 10-11am, SWD 203_
- [ ] **Cadence agreed:** Biweekly on Tuesdays from 10-11 AM in SWD 203
- [ ] **Contact channel and how fast they reply.** Email; turnaround not established
- [ ] **Who to contact between meetings**, Not Established
- [ ] **Copies requested** of every artifact you were shown. Client to allow chatbot and D2L access.
- [ ] **Introductions requested** Students, TAs, peer mentors
- [ ] **Say what happens next**, Begin planning, bring early progress back for client feedback, move toward biweekly review cadence.

---

## Initial ideas

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

Anonymity vs. research: the client wants a safe, possibly anonymous experience but also wants consenting identifiable data for future grade correlation.

Support vs. agency: reminders/planning may help freshmen, but the system should not micromanage them.

Encouragement vs. directness: different students may prefer different interaction styles.

Study plan vs. study guide: the client is more comfortable coaching study patterns/timetables than generating content-specific exam study guides.

Initial audience: broad long-term vision, but starting with the client's class is acceptable if easiest.

Prototype vs. new app: preserve useful behavior from the prototype but build a more sustainable independent application.

Adoption: only a small group has tried the current chatbot; the client plans to promote/demonstrate it more after the first exam.

## Open questions

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
