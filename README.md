# FTC Team Performance Analyzer

> **⚠️ Work in Progress**: This project is currently under active development and not yet complete. Website is not live currently.

A comprehensive scouting and performance analysis tool for FIRST Tech Challenge (FTC) robotics teams. Enter any team number to get detailed insights into their performance, strategic roles, and competitive advantages. Currently it's only built for the 2024-2025 FTC season.

## 🚀 Features

### Current Features
- **Team Performance Overview**: Win/loss ratios, average points, points over time and season statistics
- **Role Prediction**: Data analysis techniques to determinine if a team is better suited for "Sample" or "Specimen" roles
- **Matchup Analysis**: "Luck Score" calculation showing how favorable/difficult a team's opponents were
- **OPR Statistics**: Displays your best OPR (Offensive Power Rating) across these different categories: Total, Auto, Tele-op and Endgame.
- **Detailed Match History**: Complete breakdown of all matches with scores and alliance information
- **Data Caching**: MongoDB integration for faster load times and reduced API calls
- **Interactive Visualizations**: Charts and graphs for easy data interpretation

### Planned Features
- [ ] Multi-season stats
- [ ] Certain event breakdown/ scouting report 
- [ ] Team vs team direct comparison
- [ ] Advanced statistical analysis
- [ ] Mobile-responsive design improvements
- [ ] More detailed performance metrics

## 🛠️ Tech Stack

- **Frontend**: React, Recharts for visualizations
- **Backend**: Node.js (implied from API structure)
- **Database**: MongoDB for data caching
- **API**: FTCScout (GraphQL)

## 🎯 Usage

1. Open the application in your browser
2. Enter any valid FTC team number (e.g., 12345)
3. Click "Analyze" to fetch and display team data
4. Explore the various metrics and insights provided

## 🤝 Contributing

This project is currently in development. Contributions, suggestions, and feedback are welcome!

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Note**: This project is not officially affiliated with FIRST or the FIRST Tech Challenge program. Also README was created with help from AI (Claude)


