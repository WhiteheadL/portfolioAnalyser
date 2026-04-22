Example Portfolio HTML 
<!DOCTYPE html>
<html>
<head>
<title>My Portfolio</title>
<style>
body {
  font-family: Arial, sans-serif;
  margin: 0;
  padding: 20px;
  background: #ffffff;
  color: #333;
}

.hero {
  text-align: center;
  padding: 40px 20px;
  background: #6a5acd;
  color: white;
}

.hero h1 {
  font-size: 48px;
  margin: 0;
}

.hero p {
  font-size: 18px;
}

.section {
  padding: 30px;
  max-width: 1200px;
  margin: 0 auto;
}

.section h2 {
  font-size: 32px;
  color: #333;
  border-bottom: 1px solid #ccc;
  padding-bottom: 10px;
}

.projects {
  display: flex;
  flex-wrap: wrap;
}

.project {
  width: 300px;
  margin: 15px;
  border: 1px solid #ddd;
  padding: 15px;
}

.project img {
  width: 100%;
  height: 180px;
  background: #ddd;
}

.project h3 {
  font-size: 20px;
  margin-top: 10px;
}

.project p {
  color: #777;
  font-size: 14px;
}

.about {
  max-width: 700px;
}

.about p {
  line-height: 1.6;
  font-size: 16px;
}

.contact {
  text-align: center;
  padding: 30px;
  background: #f0f0f0;
}

.contact input, .contact textarea {
  display: block;
  margin: 10px auto;
  padding: 10px;
  width: 300px;
  border: 1px solid #ccc;
}

.contact button {
  background: #6a5acd;
  color: white;
  padding: 10px 30px;
  border: none;
  cursor: pointer;
}

footer {
  text-align: center;
  padding: 20px;
  color: #999;
  font-size: 12px;
}
</style>
</head>
<body>

<!-- HERO SECTION -->
<div class="hero">
  <h1>Welcome to My Portfolio</h1>
  <p>Computer Science Student</p>
</div>

<!-- ABOUT SECTION -->
<div class="section about">
  <h2>About Me</h2>
  <p>Hi, I'm a computer science student at university. I'm passionate about technology and enjoy working on various projects. I have experience with many programming languages and frameworks. I'm always looking to learn new things and improve my skills. Currently looking for internship opportunities where I can apply what I've learned and grow as a developer.</p>
  <p>My hobbies include coding, gaming, and watching movies. I also enjoy hiking on weekends.</p>
</div>

<!-- PROJECTS SECTION -->
<div class="section">
  <h2>Projects</h2>
  <div class="projects">

    <div class="project">
      <img src="project1.jpg">
      <h3>Weather App</h3>
      <p>A weather application I built. It shows the weather for different cities. Built with JavaScript.</p>
    </div>

    <div class="project">
      <img src="project2.jpg">
      <h3>Todo List</h3>
      <p>A todo list app where users can add and remove tasks. Uses local storage to save data.</p>
    </div>

    <div class="project">
      <img src="project3.jpg">
      <h3>Calculator</h3>
      <p>A simple calculator built with HTML and JavaScript. Has basic math operations.</p>
    </div>

    <div class="project">
      <img src="project4.jpg">
      <h3>Portfolio Website</h3>
      <p>This is my portfolio website you are currently viewing. Built from scratch.</p>
    </div>

  </div>
</div>

<!-- SKILLS SECTION -->
<div class="section">
  <h2>Skills</h2>
  <p>HTML, CSS, JavaScript, Python, Java, React, Node.js, Git, SQL, MongoDB, Figma, Photoshop</p>
</div>

<!-- CONTACT SECTION -->
<div class="contact">
  <h2>Contact Me</h2>
  <p>Get in touch if you'd like to work together!</p>
  <input type="text" placeholder="Your Name">
  <input type="text" placeholder="Your Email">
  <textarea placeholder="Your Message" rows="4"></textarea>
  <button onclick="alert('Message sent!')">Send Message</button>
</div>

<!-- FOOTER -->
<footer>
  <p>Copyright 2024 My Portfolio</p>
</footer>

</body>
</html>
