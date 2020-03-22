from flask import Flask, render_template, request, g, redirect, url_for, jsonify
import sqlite3
import os, time

app = Flask(__name__)


def connect_db():
    sql = sqlite3.connect('./fts_memo.db')
    sql.row_factory = sqlite3.Row
    return sql


def get_db():
    if not hasattr(g, 'sqlite_db'):
        g.sqlite_db = connect_db()
    return g.sqlite_db



@app.context_processor
def override_url_for():
    return dict(url_for=dated_url_for)

def dated_url_for(endpoint, **values):
    if endpoint == 'static':
        filename = values.get('filename', None)
        if filename:
            file_path = os.path.join(app.root_path,
                                 endpoint, filename)
            values['q'] = int(os.stat(file_path).st_mtime)
    return url_for(endpoint, **values)


@app.route('/')
def index():
    db = get_db()
    memo_cur = db.execute('select rowid as id, title, content from memo order by rowid desc')
    memos = memo_cur.fetchall()
    return render_template('home.html', memos=memos)


@app.route('/write', methods=['POST'])
def write():
    print(request.form)
    db = get_db()
    db.execute('insert into memo (title, content) values (?, ?)', [request.form['title'], request.form['content']])
    db.commit()
    return redirect(url_for('index'))


@app.route('/delete/<memo_id>', methods=['POST'])
def delete(memo_id):
    db = get_db()
    db.execute('delete from memo where rowid=?', [memo_id])
    db.commit()
    return jsonify({
        'success': True
    })
    #return redirect(url_for('index'))


@app.route('/get_memo/<memo_id>')
def get_memo(memo_id):
    print('get_memo, ', memo_id)
    db = get_db()
    memo_cur = db.execute('select rowid, title, content from memo where rowid=?', [memo_id])
    memo = memo_cur.fetchone()

    return jsonify({
        'id': memo['rowid'],
        'title': memo['title'],
        'content': memo['content']
    })

@app.route('/get_all_memos')
def get_all_memos():
    db = get_db()
    memo_cur = db.execute('select rowid, title, content from memo order by rowid desc')
    memos = memo_cur.fetchall()
    memos_list = []
    for memo in memos:
        print(memo)
        memos_list.append({
            'id': memo['rowid'],
            'title': memo['title'],
            'content': memo['content']
        })
    return jsonify(memos_list)


@app.route('/search/', defaults={'query_text': ''})
@app.route('/search/<query_text>', methods=['GET'])
def search(query_text):
    print('query_text: ', query_text)
    db = get_db()
    if query_text == '':
        memo_cur = db.execute('select rowid, title, content from memo')
    else:
        memo_cur = db.execute('select rowid, title, content from memo where memo match ?', [query_text + '*'])
    memos = memo_cur.fetchall()
    memos_list = []
    for memo in memos:
        memos_list.append({
            'id': memo['rowid'],
            'title': memo['title'],
            'content': memo['content']
        })
    return jsonify(memos_list)



@app.route('/save', methods=['POST'])
def save_memo():
    request_json = request.json
    db = get_db()
    db.execute('update memo set title=?, content=? where rowid=?', [request_json['title'], request_json['content'], request_json['id']])
    db.commit()
    return jsonify({
        'success': True
    })


@app.route('/create', methods=['PUT'])
def create_memo():
    db = get_db()
    cur = db.cursor()
    cur.execute('insert into memo (title, content) values ("", "")')
    inserted_id = cur.lastrowid
    db.commit()
    print(inserted_id)
    return jsonify({
        'success': True,
        'id': inserted_id,
        'title': '',
        'content': ''
    })


@app.route('/clear/<memo_id>', methods=['POST'])
def clear_memo(memo_id):
    db = get_db()
    db.execute('update memo set title=?, content=? where rowid=?', ['', '', memo_id])
    db.commit()
    return jsonify({
        'success': True
    })


if __name__ == '__main__':
    app.run(debug=True)