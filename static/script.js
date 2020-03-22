window.onload = () => {
    const lastMemo = document.getElementsByClassName('memo-item')[0];
    showMemo(lastMemo.getAttribute('id').split('-')[2]);
}

function clearMemo(memoId) {
    const xhr = new XMLHttpRequest();

    xhr.onreadystatechange = (e) => {
        if (xhr.readyState !== XMLHttpRequest.DONE) return;

        if (xhr.status === 200) {
            responseJSON = JSON.parse(xhr.responseText);

            const memoItem = document.getElementById('memo-item-' + memoId);
            memoItem.getElementsByClassName('memo-item-title')[0].textContent = '';
            memoItem.getElementsByClassName('memo-item-content-content')[0].textContent = '';

            document.getElementById('memo-title').value = '';
            document.getElementById('memo-content').value = '';
        } else {
            console.log('Error!');
        }
    };

    xhr.open('POST', '/clear/' + memoId);
    xhr.send();
}

function removeMemo(memoId) {
    event.stopPropagation();
    let currentMemoId = document.getElementById('memo-id').value;
    const targetMemoItem = document.getElementById('memo-item-' + memoId);

    currentMemoId = Number(currentMemoId);
    memoId = Number(memoId);

    let nextMemoItem = document.getElementById('memo-item-' + currentMemoId);

    if (currentMemoId == memoId) {
        nextMemoItem = targetMemoItem.nextElementSibling;
    }

    if (nextMemoItem === null) {
        nextMemoItem = targetMemoItem.previousElementSibling;
    }

    if (nextMemoItem === null) {
        clearMemo(memoId);
        return;
    }

    const xhr = new XMLHttpRequest();

    xhr.onreadystatechange = (e) => {
        if (xhr.readyState !== XMLHttpRequest.DONE) return;

        if (xhr.status === 200) {
            responseJSON = JSON.parse(xhr.responseText);

            const memoItemList = document.getElementById('memo-item-list');
            memoItemList.removeChild(targetMemoItem);
            showMemo(nextMemoItem.getAttribute('id').split('-')[2]);
        } else {
            console.log('Error!');
        }
    };

    xhr.open('POST', '/delete/' + memoId);
    xhr.send();
}

function addMemoItem(newMemo) {
    const memoItem = document.createElement('div');
    memoItem.classList.add('memo-item');
    memoItem.setAttribute('onclick', 'showMemo(' + newMemo['id'] + ')');
    memoItem.setAttribute('id', 'memo-item-' + newMemo['id']);

    const memoItemTitle = document.createElement('div');
    memoItemTitle.classList.add('memo-item-title');
    memoItemTitle.appendChild(document.createTextNode(newMemo['title']));

    const memoItemContent = document.createElement('div');
    memoItemContent.classList.add('memo-item-content');

    const removeButton = document.createElement('i');
    removeButton.addEventListener('click', () => {
        removeMemo(newMemo['id']);
    });
    removeButton.classList.add('remove-button', 'far', 'fa-trash-alt');

    const memoItemContentContent = document.createElement('div');
    memoItemContentContent.classList.add('memo-item-content-content');
    memoItemContentContent.appendChild(document.createTextNode(newMemo['content']));

    memoItemContent.appendChild(removeButton);
    memoItemContent.appendChild(memoItemContentContent);

    memoItem.appendChild(memoItemTitle);
    memoItem.appendChild(memoItemContent);

    const memoItemList = document.getElementById('memo-item-list');
    memoItemList.insertAdjacentElement('afterbegin', memoItem);

    showMemo(newMemo['id']);
}

function createMemo() {
    const xhr = new XMLHttpRequest();
    
    xhr.onreadystatechange = (e) => {
        if (xhr.readyState !== XMLHttpRequest.DONE) return;

        if (xhr.status === 200) {
            responseJSON = JSON.parse(xhr.responseText);
            const newMemo = {
                'id': responseJSON['id'],
                'title': responseJSON['title'],
                'content': responseJSON['content']
            };
            addMemoItem(newMemo);
        } else {
            console.log('Error!');
        }
    };

    xhr.open('PUT', '/create')
    xhr.send();
}

function updateMemoItem(memoId) {
    const xhr = new XMLHttpRequest();

    xhr.onreadystatechange = (e) => {
        if (xhr.readyState !== XMLHttpRequest.DONE) return;

        if (xhr.status === 200) {
            responseJSON = JSON.parse(xhr.responseText);
            const memoItem = document.getElementById('memo-item-' + memoId);
            const memoItemTitle = memoItem.getElementsByClassName('memo-item-title')[0];
            const memoItemContentContent = memoItem.getElementsByClassName('memo-item-content-content')[0];

            memoItemTitle.textContent = responseJSON['title']
            memoItemContentContent.textContent = responseJSON['content']

        } else {
            console.log('Error!');
        }
    };

    xhr.open('GET', '/get_memo/' + memoId);
    xhr.send();
}

function saveMemo() {
    const xhr = new XMLHttpRequest();

    const memoId = document.getElementById('memo-id').value;
    const memoTitle = document.getElementById('memo-title').value;
    const memoContent = document.getElementById('memo-content').value;

    
    xhr.onreadystatechange = (e) => {
        if (xhr.readyState !== XMLHttpRequest.DONE) return;

        if (xhr.status === 200) {
            responseJSON = JSON.parse(xhr.responseText);
            
            if (responseJSON['success'] === true) {
                const memoItem = document.getElementById('memo-item-' + memoId);
                const memoItemTitle = memoItem.getElementsByClassName('memo-item-title')[0];
                const memoItemContentContent = memoItem.getElementsByClassName('memo-item-content-content')[0];

                updateMemoItem(memoId);
                memoItemTitle.textContent = memoTitle;
                memoItemContentContent.textContent = memoContent;
            }
        } else {
            console.log('Error!');
        }
    };

    xhr.open('POST', '/save', true);
    xhr.setRequestHeader('Content-Type', 'application/json');

    const data = {
        'id': memoId,
        'title': memoTitle,
        'content': memoContent
    };
    
    xhr.send(JSON.stringify(data));
}

function showMemo(memoId) {
    const memoItem = document.getElementById('memo-item-' + memoId);

    //const currentMemoId = document.getElementById('memo-id');
    //currentMemoId.value = memoId;
    const xhr = new XMLHttpRequest();

    xhr.onreadystatechange = (e) => {
        if (xhr.readyState !== XMLHttpRequest.DONE) return;

        if (xhr.status === 200) {
            responseJSON = JSON.parse(xhr.responseText);

            memoId = document.getElementById('memo-id');
            memoTitle = document.getElementById('memo-title');
            memoContent = document.getElementById('memo-content');

            memoId.value = responseJSON['id'];
            memoTitle.value = responseJSON['title'];
            memoContent.value = responseJSON['content'];

        } else {
            console.log('Error!');
        }
    };
    
    xhr.open('GET', '/get_memo/' + memoId, true);
    xhr.send();
}


function search() {
    const searchText = document.getElementById('search-bar').value;

    
    const xhr = new XMLHttpRequest();

    xhr.onreadystatechange = (e) => {
        if (xhr.readyState !== XMLHttpRequest.DONE) return;

        if (xhr.status === 200) {
            responseJSON = JSON.parse(xhr.responseText);
            updateMemoItemList(responseJSON);
        } else {
            console.log('Error!');
        }
    };

    xhr.open('GET', '/search/' + searchText);
    xhr.send();
    
}


function updateMemoItemList(memos) {
    const memoItemList = document.getElementById('memo-item-list');
    memoItemList.innerHTML = '';
    for (let i = 0; i < memos.length; i++) {
        addMemoItem(memos[i]);
    }
}