# 💰 Personal Finance Tracker

A modern, web-based personal finance management application built with Flask and JavaScript. Track your income and expenses, visualize your financial data, and maintain a clear overview of your financial health.

![Finance Tracker](https://img.shields.io/badge/Version-1.0.0-blue.svg)
![Python](https://img.shields.io/badge/Python-3.7+-green.svg)
![Flask](https://img.shields.io/badge/Flask-2.0+-red.svg)
![License](https://img.shields.io/badge/License-MIT-yellow.svg)

## 🌟 Features

- **💸 Transaction Management**: Add, view, and delete income and expense transactions
- **📊 Financial Summary**: Real-time dashboard showing total income, expenses, and current balance
- **📈 Data Visualization**: Interactive charts powered by Chart.js
- **🏷️ Category Tracking**: Organize transactions by custom categories
- **💾 Persistent Storage**: SQLite database for reliable data storage
- **📱 Responsive Design**: Mobile-friendly interface with modern CSS styling
- **🔄 Real-time Updates**: Dynamic updates without page refresh
- **💱 Currency Support**: Indian Rupee (₹) formatting

## 🚀 Quick Start

### Prerequisites

- Python 3.7 or higher
- pip (Python package installer)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/personal-finance-tracker.git
   cd personal-finance-tracker
   ```

2. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Run the application**
   ```bash
   python app.py
   ```

4. **Access the application**
   Open your browser and navigate to `http://localhost:5000`

## 🏗️ Project Structure

```
finance-tracker/
│
├── app.py                 # Main Flask application
├── finance.db            # SQLite database (auto-generated)
├── requirements.txt      # Python dependencies
├── README.md            # Project documentation
│
├── static/
│   ├── script.js        # Frontend JavaScript logic
│   └── style.css        # Responsive CSS styling
│
└── templates/
    └── index.html       # Main HTML template
```

## 🛠️ Technology Stack

- **Backend**: Flask (Python)
- **Database**: SQLite
- **Frontend**: HTML5, CSS3, JavaScript
- **Charts**: Chart.js
- **Styling**: Custom CSS with responsive design

## 📖 API Documentation

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | Main dashboard page |
| `GET` | `/api/transactions` | Get all transactions |
| `POST` | `/api/transactions` | Add a new transaction |
| `DELETE` | `/api/transactions/<id>` | Delete a transaction |
| `GET` | `/api/summary` | Get financial summary |

### Transaction Model

```json
{
  "id": 1,
  "amount": 1500.00,
  "category": "Salary",
  "type": "income",
  "date": "2025-07-31",
  "description": "Monthly salary"
}
```

## 💡 Usage Examples

### Adding a Transaction

1. Fill in the transaction form with:
   - Amount (in rupees)
   - Type (Income or Expense)
   - Category (e.g., Food, Transport, Salary)
   - Date
   - Optional description

2. Click "Add Transaction" to save

### Viewing Financial Summary

The dashboard automatically displays:
- Total income
- Total expenses  
- Current balance (income - expenses)
- Category-wise breakdowns

## 🔧 Configuration

### Database

The application uses SQLite by default. The database file (`finance.db`) is automatically created on first run. No additional configuration required.

### Customization

- **Currency**: Modify the currency symbol in `templates/index.html` and `static/script.js`
- **Categories**: Add default categories in the frontend dropdown
- **Styling**: Customize colors and layout in `static/style.css`

## 🚀 Deployment

### Local Development
```bash
python app.py
```

### Production Deployment

For production deployment, consider:

1. **Using a production WSGI server**:
   ```bash
   pip install gunicorn
   gunicorn -w 4 -b 0.0.0.0:5000 app:app
   ```

2. **Environment variables**:
   - Set `FLASK_ENV=production`
   - Configure proper database paths
   - Use environment-specific configurations

3. **Database**: Consider migrating to PostgreSQL for production use

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🐛 Known Issues

- Currency is currently hardcoded to Indian Rupees (₹)
- No user authentication system
- Single-user application (no multi-user support)

## 🔮 Future Enhancements

- [ ] User authentication and multi-user support
- [ ] Data export functionality (CSV, PDF)
- [ ] Budget planning and alerts
- [ ] Monthly/yearly financial reports
- [ ] Integration with bank APIs
- [ ] Mobile app version
- [ ] Advanced data analytics and insights

## 📞 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/yourusername/personal-finance-tracker/issues) page
2. Create a new issue with detailed description
3. Contact: [your-email@example.com]

## 🙏 Acknowledgments

- [Flask](https://flask.palletsprojects.com/) - The web framework used
- [Chart.js](https://www.chartjs.org/) - For beautiful charts
- [SQLite](https://www.sqlite.org/) - Database engine

---

⭐ **Star this repository if you find it useful!**

Made with ❤️ by [Your Name]
