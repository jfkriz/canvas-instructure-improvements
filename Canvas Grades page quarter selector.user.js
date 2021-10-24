// ==UserScript==
// @name         Canvas Grades page quarter selector
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Make Canvas Grades Better
// @author       Jim Kriz <jim@kriz.net>
// @match        https://stxavier.instructure.com/grades
// @icon         https://www.google.com/s2/favicons?domain=instructure.com
// @grant        none
// @run-at       document-end
// ==/UserScript==

(function() {
    'use strict';

    const grades = {
        97: 'A+',
        93: 'A',
        90: 'A-',
        86: 'B+',
        83: 'B',
        80: 'B-',
        78: 'C+',
        75: 'C',
        73: 'D+',
        70: 'D',
        0: 'F'
    };

    function setGrades(selectedRow) {
        let gradeCells = selectedRow ? selectedRow.getElementsByClassName('percent') : document.getElementsByClassName('percent');

        for(let i = 0; i < gradeCells.length; i++) {
            const current = gradeCells.item(i);
            const keys = Object.keys(grades).sort((a, b) => { return b - a });
            for(let j = 0; j < keys.length; j++) {
                const k = keys[j];
                if(parseFloat(current.innerHTML) >= k && !current.innerHTML.endsWith(')')) {
                    current.innerHTML = `${current.innerHTML} (${grades[k]})`;
                    break;
                }
            };

            const currentRow = current.parentElement;
            const periodSelector = currentRow.getElementsByClassName('grading_periods_selector').item(0);
            if(periodSelector) {
                const selectedPeriod = periodSelector.options[periodSelector.selectedIndex].value;
                const course = currentRow.getElementsByClassName('course').item(0).firstChild;

                course.href = `${course.href.replace(/\?.*$/, '')}?grading_period_id=${selectedPeriod}`;
            }
        }
    }

    window.addEventListener('load', function() {
        setGrades();

        let selectors = document.getElementsByClassName("grading_periods_selector");
        let options = selectors.item(0).options;

        let table = document.getElementsByClassName("course_details observer_grades");
        let newRow = table[0].insertRow(0);
        let cell = newRow.insertCell(0);
        cell.innerHTML = "<a href='#'>Select quarter for all courses</a>";
        cell.setAttribute('class', 'course');

        cell = newRow.insertCell(1);
        cell.innerHTML = "&nbsp;";
        cell.setAttribute('class', 'percent');

        cell = newRow.insertCell(2);
        cell.innerHTML = "&nbsp;";
        cell.setAttribute('style', 'display: none;');

        let selector = document.createElement("SELECT");
        selector.setAttribute('class', 'grading_periods_selector content-box');
        for(let index = 0; index < options.length; index++) {
            const option = options[index];

            let optionElement = document.createElement('OPTION');
            optionElement.text = option.text;
            optionElement.value = option.value;
            optionElement.label = option.label;
            optionElement.selected = true;
            selector.add(optionElement);
            if(option.selected) {
                optionElement.selected = true;
                selector.selectedIndex = index;
            }
        }

        cell = newRow.insertCell(3);
        cell.appendChild(selector);
        cell.setAttribute('class', 'grading_period_dropdown');

        selector.addEventListener('change', (event) => {
            const option = event.target.item(event.target.selectedIndex);
            const dropdowns = document.getElementsByClassName("grading_periods_selector");
            for(let index = 1; index < dropdowns.length; index++) {
                const current = dropdowns.item(index);
                const options = current.options;
                for(let j = 0; j < options.length; j++) {
                    if(options[j].label.trim() == option.label.trim()) {
                        current.selectedIndex = j;
                        current.dispatchEvent(new Event('change'));
                    }
                }
            }
            setTimeout(() => { setGrades(); }, 500);
        });

        for(let i = 1; i < selectors.length; i++) {
            selectors.item(i).addEventListener('change', (event) => {
                setTimeout(() => {
                    setGrades(selectors.item(i).parentElement.parentElement);
                }, 250);
            });
        };
    }, false);
})();
