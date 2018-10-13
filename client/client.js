const resetElem = document.getElementsByClassName('db-reset')[0];
const formElem = document.getElementById('mew-form');
const loadingElem = document.getElementsByClassName('loading')[0];
const mewsElem = document.getElementsByClassName('mews')[0];
const API_URL = 'http://localhost:5000/mews';
const RESET_URL = 'http://localhost:5000/resetdb';

loadingElem.style.display = '';
formElem.style.display = 'none';

listAllMews();

resetElem.addEventListener('click', (e) => {
    console.log("RESET PRESSED");
    fetch(RESET_URL, {
        method: 'POST'
    }).then(console.log("DONE!"));
});

formElem.addEventListener('submit', (event) => {
    event.preventDefault();
    console.log("Submitted");
    const formData = new FormData(formElem);
    const name = formData.get('name');
    const content = formData.get('content');

    const mew = {
        name,
        content
    };

    formElem.style.display = 'none';
    loadingElem.style.display = '';

    fetch(API_URL, {
            method: 'POST',
            body: JSON.stringify(mew),
            headers: {
                'content-type': 'application/json'
            }
        })
        .then(response => response.json())
        .then(createdMew => {
            formElem.reset();
            formElem.style.display = '';
            loadingElem.style.display = 'none';
            listAllMews();
        });
});

function listAllMews() {
    while (mewsElem.lastChild) {
        mewsElem.removeChild(mewsElem.lastChild);
    }
    fetch(API_URL)
        .then(response => response.json())
        .then(mews => {
            console.log(mews);
            mews.forEach(mew => {
                const div = document.createElement('div');
                const header = document.createElement('h3');
                header.textContent = mew.name;
                const contents = document.createElement('p');
                contents.textContent = mew.content;
                const created = document.createElement('small');
                created.textContent = new Date(mew.created);
                div.appendChild(header);
                div.appendChild(contents);
                div.appendChild(created);
                mewsElem.appendChild(div);
            });
            formElem.style.display = '';
            loadingElem.style.display = 'none';
        });
}
