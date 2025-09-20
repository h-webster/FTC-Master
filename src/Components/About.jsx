import Header from "./Header";
import './About.css';

export default function About() {
  return (
    <div className="about-screen">
      <Header />
      <div className="about-box">
        <h2 className="about-title">About FTCMaster</h2>
        <h3><u>What is FTCMaster?</u></h3>
        <p>FTCMaster is a comprehensive tool for analyzing and visualizing FTC team data and history.
        It was developed by <a href="https://h-webster.github.io/" target="_blank">Harrison Webster</a>, who is apart of <a href="https://ftc-master.vercel.app/teams/27820" target="_blank">Rundle Robotics Castle 27820. </a>
        FTCMaster is aimed to help teams find unique data and advanced insights to help support team scouting and strategy. For example in FTC INTO THE DEEP 2024-2025, the website makes predictions on what role a team will play in an alliance (specimen or sample).
        </p>
        <br />
        <br />
        <h3><u>Future Plans</u></h3>
        FTCMaster is currently in beta and I am actively working on new features and improvements. Some of the planned features include:
        <ul>
          <li>Event insights/breakdowns</li>
          <li>Multi-year data tracking</li>
          <li>More detailed team analytics</li>
          <li>Mobile improvements</li>
        </ul>
        <br />
        <br />
        <h3><u>Acknowledgements</u></h3>
        <p>FTCMaster is inspired by many other FTC tools and resources, especially <a href="https://ftcscout.org/" target="_blank">FTCScout</a> and <a href="https://theorangealliance.org/" target="_blank">The Orange Alliance</a>. For the OPR stats I used the api data from <a href="https://ftcscout.org/" target="_blank">FTCScout</a> and all other data from <a href="https://ftc-events.firstinspires.org/services/API" target="_blank">FTC Events API</a>.</p>
        <br />
        <br />
        <h3><u>Help me!</u></h3>
        <p>I'm a grade 12 student and am obviously not a perfect seasoned developer and FTCMaster may have its issues and is constantly growing. If you would like to support the development of FTCMaster, please consider contributing to the project on <a href="https://github.com/h-Webster/FTC-Master" target="_blank">GitHub</a> or providing feedback on your experience using the tool.</p>
      </div>
    </div>
  );
}
