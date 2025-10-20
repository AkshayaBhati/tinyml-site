import React from "react";
import image1 from "./assets/syllabus/image1.jpg";
import image2 from "./assets/syllabus/image2.jpg";
import image3 from "./assets/syllabus/image3.jpg";
import image4 from "./assets/syllabus/image4.jpg";
import image5 from "./assets/syllabus/image5.jpg";
import image6 from "./assets/syllabus/image6.jpg";
import image7 from "./assets/syllabus/image7.jpg";
import tinymlGif from "./assets/syllabus/GIF1.gif"; // <-- adjust path/name

/**
 * TinyML @ Penn — Hardcoded Syllabus Page (absolute URL image fix)
 * - Expects images in: tinyml-site/public/syllabus/
 */

// Build a base-aware absolute URL (e.g., http://localhost:5173/tinyml-site/...)
function absUrlFromPublic(relPath) {
  const base = (import.meta?.env?.BASE_URL ?? "/"); // e.g. "/tinyml-site/"
  const b = base.endsWith("/") ? base.slice(0, -1) : base;
  const rel = relPath.startsWith("/") ? relPath.slice(1) : relPath; // remove leading slash if present
  return `${window.location.origin}${b}/${rel}`;
}

const Link = ({ href, children }) => (
  <a
    className="underline decoration-slate-400/50 underline-offset-2 hover:text-slate-900 dark:decoration-white/40 dark:hover:text-white"
    target="_blank"
    rel="noreferrer"
    href={href}
  >
    {children}
  </a>
);

const Pill = ({ children }) => (
  <span className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-black/5 px-3 py-1 text-[11px] uppercase tracking-wide text-slate-700 dark:border-white/15 dark:bg-white/5 dark:text-white/80">
    {children}
  </span>
);

const Card = ({ title, eyebrow, children }) => (
  <article className="rounded-2xl border border-black/10 bg-black/5 p-6 shadow-sm shadow-black/5 dark:border-white/10 dark:bg-white/[0.06]">
    <div className="mb-3 flex items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        {eyebrow && <Pill>{eyebrow}</Pill>}
        {title && <h3 className="text-xl font-semibold text-slate-900 dark:text-white">{title}</h3>}
      </div>
    </div>
    <div className="prose prose-slate max-w-none text-[15px] leading-7 dark:prose-invert">
      {children}
    </div>
  </article>
);

// file is image1.jpg in /public/syllabus/
//const image1Url = absUrlFromPublic("syllabus/image1.jpg");
const IMAGES = [
  "image1.jpg",
  "image2.jpg",
  "image3.jpg",
  "image4.jpg",
  "image5.jpg",
  "image6.jpg",
  "image7.jpg",
  "image8.png",
  "image9.png",
  "image10.png",
  "image11.gif",
].map((name) => absUrlFromPublic(`syllabus/${name}`));

export default function SyllabusPage() {
  return (
    <div className="mx-auto w-full max-w-4xl space-y-8">
      {/* Header */}
      <header className="rounded-2xl border border-black/10 bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 p-6 dark:border-white/10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              ESE 3600: Tiny Machine Learning for Embedded Systems
            </h1>
            <p className="mt-1 text-sm text-slate-600 dark:text-white/70">
              TinyML @ Penn — Fall 2025 • Amy Gutmann Hall 104 • Mon & Wed 10:15–11:44 AM
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Pill>Hands-on</Pill>
            <Pill>Edge AI</Pill>
            <Pill>Learning by Doing</Pill>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-700 dark:text-white/80">
          <div>
            <span className="font-medium">Website:</span>{" "}
            <Link href="https://tinyml.seas.upenn.edu">tinyml.seas.upenn.edu</Link>
          </div>
          <div>
            <span className="font-medium">Canvas:</span>{" "}
            <Link href="https://canvas.upenn.edu/courses/1863237">Course page</Link>
          </div>
          <div>
            <span className="font-medium">Calendar:</span>{" "}
            <Link href="https://tinyurl.com/TinyML-2025-Cal">TinyML-2025-Cal</Link>
          </div>
        </div>
      </header>

      {/* Image 1 before A.1 (absolute URL) */}
      {/* Image 1 before A.1 (themed) */}

      {/* Image 1 (banner style) */}
      <div className="rounded-2xl border border-black/10 bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 p-1 shadow-sm shadow-black/5 dark:border-white/10">
        <figure className="rounded-[1rem] overflow-hidden ring-1 ring-black/5 dark:ring-white/10">
          <img
            src={image1}
            alt="TinyML course overview"
            className="block w-full h-auto"
            loading="lazy"
          />
          <figcaption className="px-4 py-2 text-sm text-slate-600 dark:text-white/60 bg-white/50 backdrop-blur-sm dark:bg-slate-900/30">
            Course overview
          </figcaption>
        </figure>
      </div>

      
      {/* Staff */}
      <Card title="Teaching Staff">
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <h4 className="text-lg font-semibold">Instructor</h4>
            <ul className="mt-2 space-y-1">
              <li>
                <span className="font-medium">Rahul Mangharam</span> •{" "}
                <Link href="mailto:rahulm@seas.upenn.edu">rahulm@seas.upenn.edu</Link>
                <br />
                <span className="text-sm text-slate-600 dark:text-white/70">
                  Drop-in Hour: Wed 12–1 PM • Lab: Levine 279 (xLAB)
                </span>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold">TAs & Sessions</h4>
            <ul className="mt-2 space-y-2">
              <li>
                <span className="font-medium">Mohit Shah</span> — Recitation: Thu 5:00–6:00 PM •{" "}
                <Link href="mailto:moshah@seas.upenn.edu">moshah@seas.upenn.edu</Link>
              </li>
              <li>
                <span className="font-medium">Hansika Dorai</span> — Recitation: Tue 3:45–4:45 PM •{" "}
                <Link href="mailto:hadorai@seas.upenn.edu">hadorai@seas.upenn.edu</Link>
              </li>
              <li>
                <span className="font-medium">Akshaya Nidhi Bhati</span> — Office Hours: Mon 2–3 PM •{" "}
                <Link href="mailto:anbhati@seas.upenn.edu">anbhati@seas.upenn.edu</Link>
              </li>
            </ul>
          </div>
        </div>
      </Card>

      {/* What is this course about */}
      <Card title="What is this course about?" eyebrow="A.1">
        <p>
          ESE3600 Tiny Machine Learning (TinyML) is an exciting field at the intersection of embedded machine learning (ML) applications, algorithms, hardware, and software. TinyML differs from mainstream machine learning (e.g., server and cloud) in that it requires not only software expertise, but also embedded-hardware expertise. 
        </p>
        <p className="indent-8">
          This course emphasizes hands-on experience with ML training and deployment in tiny microcontroller-based devices. The course features application-based projects on a TinyML program kit that includes an Arm Cortex-M4 microcontroller with onboard sensors, a camera, and a breadboard with wires—enough to unlock capabilities such as image, sound, and gesture detection. Before you know it, you’ll be implementing an entire TinyML application. 
        </p>
        <p className="indent-8">
          The course will also feature real-world application case studies and a creative project that will help you examine the challenges facing real-world TinyML deployments.
        </p>
      </Card>

      {/* What you will learn */}
      <Card title="What you will learn" eyebrow="A.1">
        <ul className="list-disc pl-6">
          <li>Fundamentals of ML and embedded devices</li>
          <li>Data collection from sensors; dataset creation and preparation</li>
          <li>Training and deploying tiny ML models</li>
          <li>Programming with TensorFlow Lite for Microcontrollers</li>
          <li>Optimizing models for resource-constrained devices</li>
          <li>Conceiving and designing your own TinyML application</li>
          <li>Awareness of cutting-edge TinyML R&amp;D</li>
        </ul>
        <p className="mt-3 text-sm text-slate-600 dark:text-white/70">
          No prior background in ML or embedded systems required.
        </p>
      </Card>

      {/* Prereqs & Structure */}
      <Card title="Prerequisites & Course Structure">
        <p>
          <span className="font-medium">Prerequisites:</span> Basic Python programming and some exposure to
          electronics/circuits.
        </p>
        <p className="mt-3">
          <span className="font-medium">Course Structure:</span> 
          This course has 3 modules that cover (1) The Fundamentals of TinyML; (2) Applications in TinyML and (3) Deployment of TinyML on hardware. Students will learn both the practical approaches to developing and deploying TinyML using sensors and actuators for useful applications. As the course will cover state of the art techniques, we will review relevant research papers. We follow the process of ‘Learning by Doing’ so you will pick up core concepts in machine learning and embedded systems while developing practical skills.
          </p>
        <div className="mt-4 grid gap-4">
          <div>
            <h4 className="text-lg font-semibold">Module 1: Fundamentals of TinyML</h4>
            <ul className="list-disc pl-6">
              <li>Understand the Machine Learning programming paradigm </li>
              <li>Solve problems from simple regression to complex computer vision</li>
            </ul>
            <p>
              Starting with a neural network with just one neuron, we will learn core concepts on loss functions, gradient descent, back propagation, deep networks, convolutional neural networks, dropouts, dataset splits, and more to build useful networks for regression,  classification of numbers and images. This will provide the ML building blocks and basic TensorFlow coding skills  so you can build neural network-based applications in Module 2. 
            </p>
            <figure className="rounded-2xl overflow-hidden border border-black/10 bg-black/5 shadow-sm shadow-black/5 dark:border-white/10 dark:bg-white/[0.06]">
              <img
                src={image2}
                alt="TinyML Module 1"
                className="block w-full h-auto"
                loading="lazy"
              />
              <figcaption className="px-4 py-2 text-sm text-slate-600 dark:text-white/60">
               TinyML Module 1
              </figcaption>
            </figure>
          </div>
          <div>
            <h4 className="text-lg font-semibold">Module 2: Applications of TinyML</h4>
            <ul className="list-disc pl-6">
              <li>Develop apps to understand speech for keyword spotting, detect objects in images and identify anomalies in sensor data  </li>
              <li>Learn skills across the ML Lifecycle - from developing datasets, DNN models, to application deployment </li>
            </ul>
            <p>
            This module focuses on applications, data and neural networks on tiny embedded devices. We expose you to embedded devices and different real-world application scenarios of TinyML. We do this by covering the most widely used applications for TinyML for Keyword Spotting for speech processing, Visual Wake Words for image processing, and Anomaly Detection for time-series signal processing - all coupled with hands-on Co-Lab development. We focus on the neural network portion of the applications, looking at training and deployment, leaving pre and post-processing implementations and other systematic questions leading to deployment in the third module.
            </p>
            <figure className="rounded-2xl overflow-hidden border border-black/10 bg-black/5 shadow-sm shadow-black/5 dark:border-white/10 dark:bg-white/[0.06]">
              <img
                src={image3}
                alt="TinyML Module 2"
                className="block w-full h-auto"
                loading="lazy"
              />
              <figcaption className="px-4 py-2 text-sm text-slate-600 dark:text-white/60">
                 TinyML Module 2
              </figcaption>
            </figure>
          </div>
          <div>
            <h4 className="text-lg font-semibold">Module 3: Deploying on Embedded Hardware</h4>
            <ul className="list-disc pl-6">
              <li>Understand how to run ML on embedded hardware with sensors </li>
              <li>Do a project where you develop the ML pipeline to navigate a robot on a mission </li>
            </ul>
            <p>
              This module teaches you how to engineer end-to-end TinyML applications using TensorFlow Micro. We will work with real hardware to understand the basics of embedded system programming and compressing our ML models so we can deploy them in real-world embedded systems applications. 
            </p>
            <figure className="rounded-2xl overflow-hidden border border-black/10 bg-black/5 shadow-sm shadow-black/5 dark:border-white/10 dark:bg-white/[0.06]">
              <img
                src={image4}
                alt="TinyML Module 3"
                className="block w-full h-auto"
                loading="lazy"
              />
              <figcaption className="px-4 py-2 text-sm text-slate-600 dark:text-white/60">
                 TinyML Module 3
              </figcaption>
            </figure>
          </div>
        </div>
      </Card>

      {/* Mechanics */}
      <Card title="Course Mechanics" eyebrow="B">
        <p>
          We will learn from both online and offline lectures. Learning by doing will involve coding in Google’s Colab co-laboratory environment during tutorials and assignments.
        <figure className="rounded-2xl overflow-hidden border border-black/10 bg-black/5 shadow-sm shadow-black/5 dark:border-white/10 dark:bg-white/[0.06]">
              <img
                src={image5}
                alt="Course Mechanics"
                className="block w-full h-auto"
                loading="lazy"
              />
              <figcaption className="px-4 py-2 text-sm text-slate-600 dark:text-white/60">
                 Course Mechanics 
              </figcaption>
            </figure>
        </p> <br /> 
        <h4 className="text-lg font-semibold">Lectures</h4>
        <p>
          Lectures will be held in AGH 104. Regular attendance is mandatory as we will have hands-on tutorials in each session. We will have the lecture session in the first 60 minutes to cover concepts. This is followed by <Link href="https://colab.research.google.com/">Google Colab</Link> coding tutorials for the following 30 minutes. Lectures will be recorded and posted on Canvas so you can review them anytime after the lecture.
        </p>
        <h4 className="mt-4 text-lg font-semibold">Tutorials</h4>
        <p>
          Throughout the semester we will have over 27 hands-on coding tutorials. These are essential for reinforcing the machine learning concepts, learning to code in Python and understanding the TensorFlow API. We will start the tutorials in the class session and also cover them in the recitation session.
        </p>
        <h4 className="mt-4 text-lg font-semibold">Assignments</h4>
        <p>
          Assignments will challenge you to take all that you have learned and apply it to solve practical hands-on tasks. These will be done through collabs for Modules 1 and 2 and will require deploying code to the arduino microcontroller in Module 3. Please read the following list carefully.
        </p>
        <ul className="list-disc pl-6">
          <li>
            Assignments will be due every week or so, typically on Thursday midnight. Assignments are to be submitted via Canvas. 
          </li>
          <li>
            Assignments will contain traditional “pencil-and-paper” exercises along with software implementations and experimentation, to be written and graded in Python.
          </li>
          <li>
            <span className="font-medium">Late Policy:</span>
            <ul className="mt-2 list-[circle] pl-6">
              <li>
                All students will be permitted <b>FOUR Late Days</b> for assignments and <b>FOUR Late Days</b> for tutorials. These <b>cannot</b> be interchanged. Late penalties are applied <b> at the end of the semester </b> to maximize your grade.
              </li>
              <li>
               Late assignments beyond the late days can be submitted for half credit within one week of the nominal due date.
              </li>
              <li>
                There are 7 assignments and 23 tutorials. Late days give flexibility; additional extensions are <b>EXTREMELY RARE</b> and granted only in the case of emergencies.
              </li>
            </ul>
          </li>
        </ul>
        <h4 className="mt-4 text-lg font-semibold">Quizzes</h4>
        <p>
          There will be 5 quizzes throughout the semester. Quizzes will act as knowledge checks and will be short and sprinkled throughout the course to make sure you are learning the key themes. It is the student’s responsibility to inform the instructor a week in advance if they cannot attend the quiz day. 
        </p>
        <h4 className="mt-4 text-lg font-semibold">Reading</h4>
        <p>
          No required textbook. Recommended: <br></br> <em>TinyML: Machine Learning with TensorFlow Lite on Arduino and
          Ultra-Low-Power Microcontrollers</em><br></br> Authors: Pete Warden, Daniel Situnayake <br></br> <em> Publisher: O’Reilly Media  <br></br> </em> <em>ISBN-13: 978-1492052043. Date: January 2020</em>

        </p>
        <p>The Canvas site will reference a number of online texts and research papers relevant to each week’s material. We will introduce several new concepts and have dedicated readings  so you can deep dive into the math and code.</p>
        <h4 className="mt-4 text-lg font-semibold">Software</h4>
        <p>
          This course will regularly make use of Python for both in-class examples and homework. We will use <Link href="https://colab.research.google.com/">Google Colab</Link> for all assignments and projects. This will make it easy to code anywhere and anytime. Please bring your laptops to the lecture as we will have tutorials as part of each session.
        </p>
        <h4 className="mt-4 text-lg font-semibold">Project</h4>
        <p>
          At the end of the semester, students will do a project with a mobile robot. These projects are intended to take the material taught in the course and build a functioning mobile robot. Specific details on the project will be available mid-semester.
        </p>
        <figure className="rounded-2xl overflow-hidden border border-black/10 bg-black/5 shadow-sm shadow-black/5 dark:border-white/10 dark:bg-white/[0.06]">
              <img
                src={image6}
                alt="Project"
                className="block w-full h-auto"
                loading="lazy"
              />
              <figcaption className="px-4 py-2 text-sm text-slate-600 dark:text-white/60">
                 TinyML Project
              </figcaption>
        </figure>
        <p className="mt-3 text-sm text-slate-600 dark:text-white/70">
          Please note that the dates in this document are subject to change. Refer to the online calendar for the updated dates.
        </p>
      </Card>

      {/* Grading */}
      <Card title="Grading Policy">
        <div className="grid gap-2 sm:grid-cols-2">
          <ul className="list-disc pl-6">
            <li>
              <span className="font-medium">Class Participation (active in class and ed discussion, ask questions in guest lectures
):</span> 5%
            </li>
            <li>
              <span className="font-medium">Labs (Programming Assignments):</span> 30%
            </li>
            <li>
              <span className="font-medium">Tutorials (In-class training):</span> 25%
            </li>
          </ul>
          <ul className="list-disc pl-6">
            <li>
              <span className="font-medium">Quizzes (every 2–3 weeks):</span> 25%
            </li>
            <li>
              <span className="font-medium">Final Project (control a mobile robot with your TinyML code or Self-chosen 
):</span> 15%
            </li>
          </ul>

          <figure
            className="sm:col-span-2 mx-auto max-w-md w-full rounded-2xl overflow-hidden border border-black/10 bg-black/5 shadow-sm shadow-black/5 dark:border-white/10 dark:bg-white/[0.06]"
          >
            <img
              src={image7}
              alt="Grading Policy"
              className="block w-full h-auto"
              loading="lazy"
            />
            <figcaption className="px-4 py-2 text-sm text-slate-600 dark:text-white/60">
              Grading Policy
            </figcaption>
          </figure>

        </div>
      </Card>

      {/* About TinyML */}
      <Card title="About TinyML" eyebrow="C">
        <p>
          TinyML is one of the fastest-growing areas of Deep Learning. In a nutshell, it’s an emerging field of <Link href="https://petewarden.com/2018/06/11/why-the-future-of-machine-learning-is-tiny/">study</Link> that explores the types of models you can run on small, low-power devices like <Link href="https://blog.tensorflow.org/2019/11/how-to-get-started-with-machine.html">microcontrollers.</Link> 
        </p>
        <p className="indent-8">
          TinyML sits at the intersection of embedded-ML applications, algorithms, hardware and software. The goal is to enable low-latency inference at edge devices on devices that typically consume only a few <b> milliwatts </b> of battery power. By comparison, a desktop CPU would consume about 100 watts (thousands of times more!). Such a reduced power draw enables TinyML devices to operate unplugged on batteries and endure for weeks, months and possibly even years --- all while running always-on ML applications at the edge/endpoint.
        </p>

        <figure className="rounded-2xl overflow-hidden border border-black/10 bg-black/5 shadow-sm shadow-black/5 dark:border-white/10 dark:bg-white/[0.06]">
              <img
                src={tinymlGif}
                alt="TinyML demo animation"
                className="block w-full h-auto"
                loading="lazy"
              />
              <figcaption className="px-4 py-2 text-sm text-slate-600 dark:text-white/60">
                 TinyML powering a simple speech recognizer. Learn how to build your own <Link href="https://blog.tensorflow.org/2019/11/how-to-get-started-with-machine.html">here.</Link>
              </figcaption>
        </figure>

        <p className="indent-8">
          Although most of us are new to TinyML, it may surprise you to learn that TinyML has served in production ML systems for years. You may have already experienced the benefits of TinyML when you say “OK Google” to wake up an Android device. That’s powered by an always-on, low-power keyword spotter, not dissimilar in principle from the one you can learn to build <Link href="https://blog.tensorflow.org/2019/11/how-to-get-started-with-machine.html">here.</Link> 
        </p>
        <p className="indent-8">
          TinyML unlocks many applications for embedded ML developers, especially when combined with sensors like accelerometers, microphones, and cameras. It is already proving useful in areas such as wildlife tracking for conservation and detecting crop diseases for agricultural needs, as well as predicting wildfires.
        </p>
        <p className="indent-8">
          TinyML can also be fun! You can develop smart game controllers such as controlling a T-Rex dinosaur using a neural-network-based motion controller or enable a variety of other games. Using the same ML principles and technical chops, you could then imagine collecting accelerator data in a car to detect various scenarios (such as a wobbly tire) and alert the driver.
        </p>
        <p className="indent-8">
          Fun and games aside, as with any ML application--- and especially when you are working with sensor data---it’s essential to familiarize yourself with <Link href="https://blog.tensorflow.org/2020/06/responsible-ai-with-tensorflow.html">Responsible AI</Link>. TinyML can support a variety of private ML applications because inference can take place entirely at the edge (data never needs to leave the device). In fact, many tiny devices have no internet connection at all. 
        </p>
      </Card>

      {/* Student Support */}
      <Card title="Student Support at Penn" eyebrow="D">
        <h4 className="text-lg font-semibold">Wellness & Counseling</h4>
        <p>
         You are not alone. Most if not all students struggle at some point throughout their study, but there are many helpful resources available on campus. If you or someone you know is going through a tough time, we strongly encourage you to seek support. <b> Counseling and Psychological Services (CAPS) </b> is the counseling cen- ter for the University of Pennsylvania. CAPS offers free and confidential services to all Penn students. For more information, visit <Link href="http://www.vpul.upenn.edu/caps/">http://www.vpul.upenn.edu/caps/</Link>. Consider also reaching out to a friend, family or faculty member.
        <h4 className="mt-4 text-lg font-semibold">Academic Integrity</h4>
        </p>
        <p>
         From the Pennbook:
        </p>
        <br></br>
        <p>
          Since the University is an academic community, its fundamental purpose is the pursuit of knowl- edge. Essential to the success of this educational mission is a commitment to the principles of academic integrity. Every member of the University community is responsible for upholding the highest standards of honesty at all times. Students, as members of the community, are also responsible for adhering to the principles and spirit of the following Code of Academic Integrity.
        </p>
        <br></br>
        <p>
          Consequences for academic dishonesty range from receiving a 0 on a homework or exam to disciplinary action.
        </p>
        <p>
         <b>Any suspected cheating will be reported to the Office of Student Conduct for investigation.</b>
        </p>
        <p>
          Ignorance of the Code of Academic Integrity is not an acceptable defense. For example, using outside solutions to homework problems is not acceptable.
        </p>
        <ul className="list-disc pl-6">
          <li>
            Code of Academic Integrity:{" "}
            <Link href="https://catalog.upenn.edu/pennbook/code-of-academic-integrity/">
              catalog.upenn.edu/pennbook/code-of-academic-integrity
            </Link>
          </li>
          <li>
            SEAS Student Code of Ethics:{" "}
            <Link href="https://ugrad.seas.upenn.edu/student-handbook/student-code-of-conduct/">
              ugrad.seas.upenn.edu/student-handbook/student-code-of-conduct
            </Link>
          </li>
        </ul>
        <h4 className="mt-4 text-lg font-semibold">Sexual Harassment & Related Policies</h4>
        <p>
         All forms of sexual violence, relationship violence and stalking and attempts to commit such acts are considered to be serious misconduct and may result in disciplinary action up to and including expulsion or termina- tion of employment. In addition, such acts may violate federal, state and local laws and perpetrators of such acts may be subject to criminal prosecution. For more information, please refer to Penn’s Sexual Harassment Policy
          <Link href="https://pvp.vpul.upenn.edu/sexual-misconduct-policy/">
          , pvp.vpul.upenn.edu/sexual-misconduct-policy
          </Link>
          , as well as the other related policies available at this link.
        </p>
        <h4 className="mt-4 text-lg font-semibold">Students with Disabilities & Learning Differences</h4>
        <p>
          Students with disabilities are encouraged to contact Weingarten Learning Resource Center’s Office for Stu- dent Disabilities Services for information and assistance with the process of accessing reasonable accommodations. For more information, visit
          <Link href="https://wlrc.vpul.upenn.edu/"> wlrc.vpul.upenn.edu</Link>.
        </p>
      </Card>

      <footer className="mt-16">
        <div className="relative overflow-hidden rounded-3xl border border-black/10 bg-gradient-to-r from-emerald-500/15 via-cyan-500/15 to-fuchsia-500/15 p-8 sm:p-12 text-center dark:border-white/10">
          {/* subtle glow blobs */}
          <div className="pointer-events-none absolute -left-10 -top-10 h-40 w-40 rounded-full bg-emerald-400/30 blur-3xl" />
          <div className="pointer-events-none absolute -right-12 -bottom-12 h-48 w-48 rounded-full bg-fuchsia-400/30 blur-3xl" />

          <p className="relative text-3xl sm:text-5xl font-extrabold tracking-tight">
            <span className="bg-gradient-to-r from-emerald-500 via-cyan-500 to-fuchsia-500 bg-clip-text text-transparent">
              Learn a lot and have fun!
            </span>{" "}
          </p>

          <p className="relative mt-3 text-sm sm:text-base text-slate-600 dark:text-white/70">
            TinyML @ Penn
          </p>
        </div>
      </footer>

     </div>
  );
}
