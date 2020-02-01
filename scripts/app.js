(function () {
    'use strict';

    //check for support
    if (!('indexedDB' in window)) {
        console.log('This browser doesn\'t support IndexedDB');
        return;
    }

    var INDEXEDDB_NAME = 'IDB';
    var OBJECTSTORE = 'timetable';
    var db;

    async function getTimeTable(){
        while(db.isLoading) {}
        let db = request.result;
        let tx = db.transaction('timeTable');
        let timeTable = tx.objectStore('timeTable');

        let records = await timeTable.getAll();

        console.log(records);
    }

    var app = {
        isLoading: true,
        visibleCards: {},
        selectedTimetables: [],
        spinner: document.querySelector('.loader'),
        cardTemplate: document.querySelector('.cardTemplate'),
        container: document.querySelector('.main'),
        addDialog: document.querySelector('.dialog-container')
    };


    /*****************************************************************************
     *
     * Event listeners for UI elements
     *
     ****************************************************************************/

    document.getElementById('butRefresh').addEventListener('click', function () {
        // Refresh all of the metro stations
        app.updateSchedules();
    });

    document.getElementById('butAdd').addEventListener('click', function () {
        // Open/show the add new station dialog
        app.toggleAddDialog(true);
    });

    document.getElementById('butAddCity').addEventListener('click', function () {
        var select = document.getElementById('selectTimetableToAdd');
        var selected = select.options[select.selectedIndex];
        var key = selected.value;
        var label = selected.textContent;
        if (!app.selectedTimetables) {
            app.selectedTimetables = [];
        }
        app.getSchedule(key, label);
        app.selectedTimetables.push({key: key, label: label});
        app.updateSelectedTimeTableIndexedDB();
        app.toggleAddDialog(false);
    });

    document.getElementById('butAddCancel').addEventListener('click', function () {
        // Close the add new station dialog
        app.toggleAddDialog(false);
    });


    /*****************************************************************************
     *
     * Methods to update/refresh the UI
     *
     ****************************************************************************/

    // Toggles the visibility of the add new station dialog.
    app.toggleAddDialog = function (visible) {
        if (visible) {
            app.addDialog.classList.add('dialog-container--visible');
        } else {
            app.addDialog.classList.remove('dialog-container--visible');
        }
    };

    // Updates a timestation card with the latest weather forecast. If the card
    // doesn't already exist, it's cloned from the template.

    app.updateTimetableCard = function (data) {
        var key = data.key;
        var dataLastUpdated = new Date(data.created);
        var schedules = data.schedules;
        var card = app.visibleCards[key];

        if (!card) {
            var label = data.label.split(', ');
            var title = label[0];
            var subtitle = label[1];
            card = app.cardTemplate.cloneNode(true);
            card.classList.remove('cardTemplate');
            card.querySelector('.label').textContent = title;
            card.querySelector('.subtitle').textContent = subtitle;
            card.removeAttribute('hidden');
            app.container.appendChild(card);
            app.visibleCards[key] = card;
        }
        card.querySelector('.card-last-updated').textContent = data.created;

        var scheduleUIs = card.querySelectorAll('.schedule');
        for(var i = 0; i<4; i++) {
            var schedule = schedules[i];
            var scheduleUI = scheduleUIs[i];
            if(schedule && scheduleUI) {
                scheduleUI.querySelector('.message').textContent = schedule.message;
            }
        }

        if (app.isLoading) {
            app.spinner.setAttribute('hidden', true);
            app.container.removeAttribute('hidden');
            app.isLoading = false;
        }
    };

    /*****************************************************************************
     *
     * Methods for dealing with the IndexedDB data
     *
     ****************************************************************************/

    app.initSchedules = async function() {
        var transaction = await db.transaction(OBJECTSTORE, 'readonly');
        var objectStore = await transaction.objectStore(OBJECTSTORE);
        var objectRequest = objectStore.getAll();
        objectRequest.onsuccess = function(event) {
            if(event.target.result !== undefined)
            {
                var timeTable = event.target.result;
                if(timeTable.length > 0) {
                    timeTable.forEach(function(item) { 
                        app.getSchedule(item.key, item.label);
                        app.selectedTimetables.push({key: item.key, label: item.label}) 
                    });
                }
                else
                {
                    app.selectedTimetables = [{key: initialStationTimetable.key, label: initialStationTimetable.label}];
                    app.updateSelectedTimeTableIndexedDB();
                }
            }
        }
    }

    app.updateSelectedTimeTableIndexedDB = async function () {
        var transaction = await db.transaction(OBJECTSTORE, 'readwrite');
        var objectStore = await transaction.objectStore(OBJECTSTORE);
        var clearRequest = await objectStore.clear();
        app.selectedTimetables.forEach(function(item) {
            var db_op_req = objectStore.add(item);
            db_op_req.onsuccess = function(){
                console.log('timetable added to the store', db_op_req.result);
            }
            db_op_req.onerror = function() {
                console.log('error adding timetable to the store', db_op_req.error);
            }
        });
    }

    /*****************************************************************************
     *
     * Methods for dealing with the model
     *
     ****************************************************************************/


    app.getSchedule = function (key, label) {
        var url = 'https://api-ratp.pierre-grimaud.fr/v3/schedules/' + key;

        var request = new XMLHttpRequest();
        request.onreadystatechange = function () {
            if (request.readyState === XMLHttpRequest.DONE) {
                if (request.status === 200) {
                    var response = JSON.parse(request.response);
                    var result = {};
                    result.key = key;
                    result.label = label;
                    result.created = response._metadata.date;
                    result.schedules = response.result.schedules;
                    app.updateTimetableCard(result);
                }
            } else {
                // Return the initial metro schedule forecast since no data is available.
                app.updateTimetableCard(initialStationTimetable);
            }
        };
        request.open('GET', url);
        request.send();
    };

    // Iterate all of the cards and attempt to get the latest timetable data
    app.updateSchedules = function () {
        var keys = Object.keys(app.visibleCards);
        keys.forEach(function (key) {
            app.getSchedule(key);
        });
    };

    /*
     * Fake timetable data that is presented when the user first uses the app,
     * or when the user has not saved any stations. See startup code for more
     * discussion.
     */

    var initialStationTimetable = {

        key: 'metros/1/bastille/A',
        label: 'Bastille, Direction La Défense',
        created: '2017-07-18T17:08:42+02:00',
        schedules: [
            {
                message: '0 mn'
            },
            {
                message: '2 mn'
            },
            {
                message: '5 mn'
            }
        ]


    };

    /************************************************************************
     *
     * Code required to start the app
     *
     * NOTE: To simplify this codelab, we've used localStorage.
     *   localStorage is a synchronous API and has serious performance
     *   implications. It should not be used in production applications!
     *   Instead, check out IDB (https://www.npmjs.com/package/idb) or
     *   SimpleDB (https://gist.github.com/inexorabletash/c8069c042b734519680c)
     ************************************************************************/

    let request = indexedDB.open(INDEXEDDB_NAME, 1);
    request.onsuccess = function(event) {
        console.log('[onsuccess]', request.result);
        db = request.result;

        app.initSchedules();

        app.getSchedule('metros/1/bastille/A', 'Bastille, Direction La Défense');
    };
    request.onupgradeneeded = function() {
        db = request.result;
        if(!db.objectStoreNames.contains(OBJECTSTORE))
            db.createObjectStore(OBJECTSTORE, {keyPath: 'key'});
    };

})();
