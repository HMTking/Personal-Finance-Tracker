from flask import Flask, render_template, request, jsonify, redirect, url_for
import sqlite3
from datetime import datetime
import os

app = Flask(__name__)

# Database setup
DATABASE = 'finance.db'

def init_db():
    """Initialize the database with the transactions table"""
    conn = sqlite3.connect(DATABASE)
    cursor = conn.cursor()
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS transactions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            amount REAL NOT NULL,
            category TEXT NOT NULL,
            type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
            date TEXT NOT NULL,
            description TEXT
        )
    ''')
    
    conn.commit()
    conn.close()

def get_db_connection():
    """Get database connection"""
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn

@app.route('/')
def index():
    """Main dashboard page"""
    return render_template('index.html')

@app.route('/api/transactions', methods=['GET'])
def get_transactions():
    """Get all transactions"""
    conn = get_db_connection()
    transactions = conn.execute(
        'SELECT * FROM transactions ORDER BY date DESC'
    ).fetchall()
    conn.close()
    
    return jsonify([dict(row) for row in transactions])

@app.route('/api/transactions', methods=['POST'])
def add_transaction():
    """Add a new transaction"""
    data = request.get_json()
    
    # Validate required fields
    required_fields = ['amount', 'category', 'type', 'date']
    for field in required_fields:
        if field not in data or not data[field]:
            return jsonify({'error': f'Missing required field: {field}'}), 400
    
    # Validate transaction type
    if data['type'] not in ['income', 'expense']:
        return jsonify({'error': 'Type must be either income or expense'}), 400
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO transactions (amount, category, type, date, description)
            VALUES (?, ?, ?, ?, ?)
        ''', (
            float(data['amount']),
            data['category'],
            data['type'],
            data['date'],
            data.get('description', '')
        ))
        
        conn.commit()
        transaction_id = cursor.lastrowid
        conn.close()
        
        return jsonify({'id': transaction_id, 'message': 'Transaction added successfully'}), 201
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/transactions/<int:transaction_id>', methods=['DELETE'])
def delete_transaction(transaction_id):
    """Delete a transaction"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute('DELETE FROM transactions WHERE id = ?', (transaction_id,))
        
        if cursor.rowcount == 0:
            conn.close()
            return jsonify({'error': 'Transaction not found'}), 404
        
        conn.commit()
        conn.close()
        
        return jsonify({'message': 'Transaction deleted successfully'}), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/summary', methods=['GET'])
def get_summary():
    """Get financial summary"""
    conn = get_db_connection()
    
    # Get total income
    income_result = conn.execute(
        'SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE type = "income"'
    ).fetchone()
    total_income = income_result['total']
    
    # Get total expenses
    expense_result = conn.execute(
        'SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE type = "expense"'
    ).fetchone()
    total_expenses = expense_result['total']
    
    # Get expenses by category
    expense_categories = conn.execute('''
        SELECT category, SUM(amount) as total 
        FROM transactions 
        WHERE type = "expense" 
        GROUP BY category
        ORDER BY total DESC
    ''').fetchall()
    
    # Get income by category
    income_categories = conn.execute('''
        SELECT category, SUM(amount) as total 
        FROM transactions 
        WHERE type = "income" 
        GROUP BY category
        ORDER BY total DESC
    ''').fetchall()
    
    conn.close()
    
    current_balance = total_income - total_expenses
    
    return jsonify({
        'total_income': total_income,
        'total_expenses': total_expenses,
        'current_balance': current_balance,
        'expenses_by_category': [dict(row) for row in expense_categories],
        'income_by_category': [dict(row) for row in income_categories]
    })

if __name__ == '__main__':
    init_db()
    app.run(debug=True, host='0.0.0.0', port=5000)
