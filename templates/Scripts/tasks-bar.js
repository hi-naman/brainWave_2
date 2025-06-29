// tasks-bar.js

document.addEventListener('DOMContentLoaded', () => {
    const taskList = document.querySelector('#task-list');
    const addButton = document.querySelector('#add-btn');
    const inputField = document.querySelector('#task-input');

    // Add new task
    addButton.addEventListener('click', () => {
        if (inputField.value.trim() !== '') {
            addTask(inputField.value.trim());
            inputField.value = '';
        }
    });

    // Event delegation for delete and DnD
    taskList.addEventListener('click', (e) => {
        if (e.target.classList.contains('delete-btn')) {
            e.target.closest('li').remove();
        }
    });

    taskList.addEventListener('dragstart', (e) => {
        e.target.classList.add('dragging');
    });

    taskList.addEventListener('dragend', (e) => {
        e.target.classList.remove('dragging');
    });

    taskList.addEventListener('dragover', (e) => {
        e.preventDefault();
        const dragging = document.querySelector('.dragging');
        const afterElement = getDragAfterElement(taskList, e.clientY);
        if (afterElement == null) {
            taskList.appendChild(dragging);
        } else {
            taskList.insertBefore(dragging, afterElement);
        }
    });

    function addTask(taskText) {
        const li = document.createElement('li');
        li.classList.add('task');
        li.draggable = true;
        li.innerHTML = `
            <span>${taskText}</span>
            <button class="delete-btn">Delete</button>
        `;
        taskList.appendChild(li);
    }

    function getDragAfterElement(container, y) {
        const draggableElements = [...container.querySelectorAll('.task:not(.dragging)')];

        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;
            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }
});
