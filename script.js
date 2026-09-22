/* =========================================================
   SCHOOL TIMETABLE GENERATOR
   EBENEZER DAY STAR ACADEMY
========================================================= */

const STORAGE_KEY = "schoolTimetableGenerator";

const DAYS = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday"
];


/* =========================================================
   DEFAULT DATA
========================================================= */

const DEFAULT_DATA = {

    school: {
        name: "",
        session: "2026/2027",
        term: "First Term"
    },

    classes: [],

    subjects: [],

    teachers: [],

    periods: [],

    timetable: {},

    settings: {
        schoolDays: 5,
        maxAttempts: 500
    }

};


/* =========================================================
   GLOBAL DATA
========================================================= */

let data = loadData();

let editingTeacherId = null;


/* =========================================================
   INITIALIZATION
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    init
);


function init() {

    bindNavigation();

    bindForms();

    bindButtons();

    renderAll();

}


/* =========================================================
   GENERATE ID
========================================================= */

function generateId(prefix = "id") {

    if (
        typeof crypto !== "undefined" &&
        crypto.randomUUID
    ) {

        return `${prefix}-${crypto.randomUUID()}`;

    }

    return (
        prefix +
        "-" +
        Date.now() +
        "-" +
        Math.random()
            .toString(36)
            .substring(2, 9)
    );
}


/* =========================================================
   LOAD DATA
========================================================= */

function loadData() {

    try {

        const saved =
            localStorage.getItem(STORAGE_KEY);

        if (!saved) {

            return structuredClone
                ? structuredClone(DEFAULT_DATA)
                : JSON.parse(
                    JSON.stringify(DEFAULT_DATA)
                );

        }

        const parsed =
            JSON.parse(saved);


        const loaded = {

            school: {
                ...DEFAULT_DATA.school,
                ...(parsed.school || {})
            },

            classes: Array.isArray(parsed.classes)
                ? parsed.classes
                : [],

            subjects: Array.isArray(parsed.subjects)
                ? parsed.subjects
                : [],

            teachers: Array.isArray(parsed.teachers)
                ? parsed.teachers
                : [],

            periods: Array.isArray(parsed.periods)
                ? parsed.periods
                : [],

            timetable:
                parsed.timetable &&
                typeof parsed.timetable === "object"
                    ? parsed.timetable
                    : {},

            settings: {
                ...DEFAULT_DATA.settings,
                ...(parsed.settings || {})
            }

        };


        /* -------------------------------------------------
           MIGRATE OLD TEACHER DATA
        ------------------------------------------------- */

        loaded.teachers =
            loaded.teachers.map(teacher => {

                let subjectIds = [];

                if (
                    Array.isArray(
                        teacher.subjectIds
                    )
                ) {

                    subjectIds =
                        teacher.subjectIds;

                }
                else if (
                    teacher.subjectId
                ) {

                    subjectIds = [
                        teacher.subjectId
                    ];

                }


                return {

                    ...teacher,

                    subjectIds,

                    assignedClassIds:
                        Array.isArray(
                            teacher.assignedClassIds
                        )
                            ? teacher.assignedClassIds
                            : []

                };

            });


        return loaded;

    }
    catch (error) {

        console.error(
            "Unable to load saved data:",
            error
        );

        return JSON.parse(
            JSON.stringify(DEFAULT_DATA)
        );

    }

}


/* =========================================================
   SAVE DATA
========================================================= */

function saveData() {

    try {

        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(data)
        );

        return true;

    }
    catch (error) {

        console.error(
            "Unable to save data:",
            error
        );

        showError(
            "Saving Failed",
            "Your data could not be saved to this device."
        );

        return false;

    }

}


/* =========================================================
   SWEETALERT HELPERS
========================================================= */

function showSuccess(
    title,
    text = ""
) {

    Swal.fire({
        icon: "success",
        title,
        text,
        confirmButtonText: "OK"
    });

}


function showError(
    title,
    text = ""
) {

    Swal.fire({
        icon: "error",
        title,
        html: text || "",
        confirmButtonText: "OK"
    });

}


function showWarning(
    title,
    text = ""
) {

    Swal.fire({
        icon: "warning",
        title,
        html: text || "",
        confirmButtonText: "OK"
    });

}


function showInfo(
    title,
    text = ""
) {

    Swal.fire({
        icon: "info",
        title,
        text,
        confirmButtonText: "OK"
    });

}


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHtml(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


/* =========================================================
   NAVIGATION
========================================================= */

function bindNavigation() {

    const navItems =
        document.querySelectorAll(
            ".nav-item"
        );

    navItems.forEach(button => {

        button.addEventListener(
            "click",
            () => {

                const sectionId =
                    button.dataset.section;

                navItems.forEach(item => {

                    item.classList.remove(
                        "active"
                    );

                });

                button.classList.add(
                    "active"
                );


                document
                    .querySelectorAll(
                        ".content-section"
                    )
                    .forEach(section => {

                        section.classList.remove(
                            "active"
                        );

                    });


                const section =
                    document.getElementById(
                        sectionId
                    );

                if (section) {

                    section.classList.add(
                        "active"
                    );

                }


                const sidebar =
                    document.getElementById(
                        "sidebar"
                    );

                if (sidebar) {

                    sidebar.classList.remove(
                        "open"
                    );

                }

            }
        );

    });

}


/* =========================================================
   BUTTONS
========================================================= */

function bindButtons() {

    const menuBtn =
        document.getElementById(
            "menuBtn"
        );

    if (menuBtn) {

        menuBtn.addEventListener(
            "click",
            () => {

                const sidebar =
                    document.getElementById(
                        "sidebar"
                    );

                sidebar?.classList.toggle(
                    "open"
                );

            }
        );

    }


    document
        .getElementById("saveSchoolBtn")
        ?.addEventListener(
            "click",
            saveSchoolInformation
        );


    document
        .getElementById("generateBtn")
        ?.addEventListener(
            "click",
            generateTimetable
        );


    document
        .getElementById(
            "generateFromDashboard"
        )
        ?.addEventListener(
            "click",
            generateTimetable
        );


    document
        .getElementById("printBtn")
        ?.addEventListener(
            "click",
            printTimetable
        );


    document
        .getElementById("loadSampleBtn")
        ?.addEventListener(
            "click",
            loadSampleData
        );


    document
        .getElementById("clearAllBtn")
        ?.addEventListener(
            "click",
            clearAllData
        );


    document
        .getElementById("closeModalBtn")
        ?.addEventListener(
            "click",
            closeTeacherModal
        );


    document
        .getElementById("cancelEditBtn")
        ?.addEventListener(
            "click",
            closeTeacherModal
        );


    document
        .getElementById("saveEditBtn")
        ?.addEventListener(
            "click",
            saveTeacherEdit
        );


    document
        .getElementById(
            "classSelector"
        )
        ?.addEventListener(
            "change",
            renderTimetable
        );


    document
        .getElementById(
            "schoolDays"
        )
        ?.addEventListener(
            "change",
            () => {

                data.settings.schoolDays =
                    Number(
                        document.getElementById(
                            "schoolDays"
                        ).value
                    );

                saveData();

            }
        );


    document
        .getElementById(
            "maxAttempts"
        )
        ?.addEventListener(
            "change",
            () => {

                data.settings.maxAttempts =
                    Number(
                        document.getElementById(
                            "maxAttempts"
                        ).value
                    );

                saveData();

            }
        );

}


/* =========================================================
   FORMS
========================================================= */

function bindForms() {

    document
        .getElementById("classForm")
        ?.addEventListener(
            "submit",
            addClass
        );


    document
        .getElementById("subjectForm")
        ?.addEventListener(
            "submit",
            addSubject
        );


    document
        .getElementById("teacherForm")
        ?.addEventListener(
            "submit",
            addTeacher
        );


    document
        .getElementById("periodForm")
        ?.addEventListener(
            "submit",
            addPeriod
        );

}


/* =========================================================
   SCHOOL INFORMATION
========================================================= */

function saveSchoolInformation() {

    data.school.name =
        document.getElementById(
            "schoolName"
        ).value.trim();

    data.school.session =
        document.getElementById(
            "session"
        ).value.trim();

    data.school.term =
        document.getElementById(
            "term"
        ).value;


    if (!data.school.name) {

        showWarning(
            "School Name Required",
            "Please enter the school name."
        );

        return;

    }


    if (!data.school.session) {

        showWarning(
            "Academic Session Required",
            "Please enter the academic session."
        );

        return;

    }


    if (saveData()) {

        showSuccess(
            "School Information Saved"
        );

    }

}


/* =========================================================
   ADD CLASS
========================================================= */

function addClass(event) {

    event.preventDefault();

    const name =
        document
            .getElementById("className")
            .value
            .trim();

    const arm =
        document
            .getElementById("classArm")
            .value
            .trim();


    if (!name) {

        showWarning(
            "Class Name Required",
            "Please enter the class name."
        );

        return;

    }


    const duplicate =
        data.classes.some(classItem =>

            classItem.name.toLowerCase() ===
            name.toLowerCase() &&

            String(
                classItem.arm || ""
            ).toLowerCase() ===
            String(arm).toLowerCase()

        );


    if (duplicate) {

        showWarning(
            "Class Already Exists",
            "This class has already been added."
        );

        return;

    }


    data.classes.push({

        id: generateId("class"),

        name,

        arm

    });


    data.timetable = {};

    saveData();

    document
        .getElementById("classForm")
        .reset();

    renderAll();

    showSuccess(
        "Class Added",
        `${name}${arm ? " " + arm : ""} has been added.`
    );

}


/* =========================================================
   ADD SUBJECT
========================================================= */

function addSubject(event) {

    event.preventDefault();

    const name =
        document
            .getElementById("subjectName")
            .value
            .trim();

    const code =
        document
            .getElementById("subjectCode")
            .value
            .trim();

    const frequency =
        Number(
            document
                .getElementById(
                    "weeklyFrequency"
                )
                .value
        );


    if (!name) {

        showWarning(
            "Subject Name Required",
            "Please enter the subject name."
        );

        return;

    }


    if (
        !Number.isFinite(frequency) ||
        frequency < 1
    ) {

        showWarning(
            "Invalid Frequency",
            "Weekly frequency must be at least 1."
        );

        return;

    }


    const duplicate =
        data.subjects.some(subject =>

            subject.name.toLowerCase() ===
            name.toLowerCase()

        );


    if (duplicate) {

        showWarning(
            "Subject Already Exists",
            "This subject has already been added."
        );

        return;

    }


    data.subjects.push({

        id: generateId("subject"),

        name,

        code,

        weeklyFrequency: frequency

    });


    data.timetable = {};

    saveData();

    document
        .getElementById("subjectForm")
        .reset();

    document
        .getElementById(
            "weeklyFrequency"
        )
        .value = 4;

    renderAll();

    showSuccess(
        "Subject Added"
    );

}


/* =========================================================
   GET SELECTED VALUES
========================================================= */

function getSelectedValues(select) {

    if (!select) {
        return [];
    }

    return Array.from(
        select.selectedOptions || []
    ).map(
        option => option.value
    );

}


/* =========================================================
   ADD TEACHER
========================================================= */

function addTeacher(event) {

    event.preventDefault();

    const name =
        document
            .getElementById("teacherName")
            .value
            .trim();

    const subjectIds =
        getSelectedValues(
            document.getElementById(
                "teacherSubject"
            )
        );

    const assignedClassIds =
        getSelectedValues(
            document.getElementById(
                "teacherClasses"
            )
        );


    if (!name) {

        showWarning(
            "Teacher Name Required",
            "Please enter the teacher's name."
        );

        return;

    }


    if (!subjectIds.length) {

        showWarning(
            "Select Subjects",
            "Select at least one subject this teacher can teach."
        );

        return;

    }


    if (!assignedClassIds.length) {

        showWarning(
            "Select Classes",
            "Select at least one class this teacher can teach."
        );

        return;

    }


    data.teachers.push({

        id: generateId("teacher"),

        name,

        subjectIds,

        assignedClassIds

    });


    data.timetable = {};

    saveData();

    document
        .getElementById("teacherForm")
        .reset();

    renderAll();

    showSuccess(
        "Teacher Added",
        `${name} can now teach the selected subjects and classes.`
    );

}


/* =========================================================
   ADD PERIOD
========================================================= */

function addPeriod(event) {

    event.preventDefault();

    const name =
        document
            .getElementById("periodName")
            .value
            .trim();

    const startTime =
        document
            .getElementById("startTime")
            .value;

    const endTime =
        document
            .getElementById("endTime")
            .value;


    if (!name || !startTime || !endTime) {

        showWarning(
            "Incomplete Period",
            "Please enter the period name, start time and end time."
        );

        return;

    }


    if (startTime >= endTime) {

        showWarning(
            "Invalid Time",
            "The end time must be later than the start time."
        );

        return;

    }


    data.periods.push({

        id: generateId("period"),

        name,

        startTime,

        endTime

    });


    data.timetable = {};

    saveData();

    document
        .getElementById("periodForm")
        .reset();

    renderAll();

    showSuccess(
        "Period Added"
    );

}


/* =========================================================
   RENDER ALL
========================================================= */

function renderAll() {

    renderSchoolInformation();

    renderClasses();

    renderSubjects();

    renderTeachers();

    renderPeriods();

    renderStats();

    populateTeacherSubjectOptions();

    populateTeacherClassOptions();

    populateClassSelector();

    renderSettings();

    renderTimetable();

}


/* =========================================================
   RENDER SCHOOL
========================================================= */

function renderSchoolInformation() {

    const schoolName =
        document.getElementById(
            "schoolName"
        );

    const session =
        document.getElementById(
            "session"
        );

    const term =
        document.getElementById(
            "term"
        );


    if (schoolName) {
        schoolName.value =
            data.school.name || "";
    }

    if (session) {
        session.value =
            data.school.session || "";
    }

    if (term) {
        term.value =
            data.school.term ||
            "First Term";
    }

}


/* =========================================================
   RENDER CLASSES
========================================================= */

function renderClasses() {

    const tbody =
        document.getElementById(
            "classesTableBody"
        );

    if (!tbody) return;


    if (!data.classes.length) {

        tbody.innerHTML = `
            <tr>
                <td colspan="3">
                    No classes added yet.
                </td>
            </tr>
        `;

        return;

    }


    tbody.innerHTML =
        data.classes.map(classItem => `

            <tr>

                <td>
                    ${escapeHtml(classItem.name)}
                </td>

                <td>
                    ${escapeHtml(
                        classItem.arm || "-"
                    )}
                </td>

                <td>

                    <button
                        type="button"
                        class="btn btn-danger"
                        data-action="delete-class"
                        data-id="${classItem.id}"
                    >
                        Delete
                    </button>

                </td>

            </tr>

        `).join("");


    tbody
        .querySelectorAll(
            '[data-action="delete-class"]'
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => deleteClass(
                    button.dataset.id
                )
            );

        });

}


/* =========================================================
   RENDER SUBJECTS
========================================================= */

function renderSubjects() {

    const tbody =
        document.getElementById(
            "subjectsTableBody"
        );

    if (!tbody) return;


    if (!data.subjects.length) {

        tbody.innerHTML = `
            <tr>
                <td colspan="4">
                    No subjects added yet.
                </td>
            </tr>
        `;

        return;

    }


    tbody.innerHTML =
        data.subjects.map(subject => `

            <tr>

                <td>
                    ${escapeHtml(subject.name)}
                </td>

                <td>
                    ${escapeHtml(
                        subject.code || "-"
                    )}
                </td>

                <td>
                    ${Number(
                        subject.weeklyFrequency
                    ) || 0}
                </td>

                <td>

                    <button
                        type="button"
                        class="btn btn-danger"
                        data-action="delete-subject"
                        data-id="${subject.id}"
                    >
                        Delete
                    </button>

                </td>

            </tr>

        `).join("");


    tbody
        .querySelectorAll(
            '[data-action="delete-subject"]'
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => deleteSubject(
                    button.dataset.id
                )
            );

        });

}


/* =========================================================
   POPULATE TEACHER SUBJECT OPTIONS
========================================================= */

function populateTeacherSubjectOptions() {

    const select =
        document.getElementById(
            "teacherSubject"
        );

    const editSelect =
        document.getElementById(
            "editSubject"
        );


    const options = data.subjects.map(
        subject => `

            <option value="${subject.id}">
                ${escapeHtml(subject.name)}
            </option>

        `
    ).join("");


    if (select) {
        select.innerHTML = options;
    }

    if (editSelect) {
        editSelect.innerHTML = options;
    }

}


/* =========================================================
   POPULATE TEACHER CLASS OPTIONS
========================================================= */

function populateTeacherClassOptions() {

    const select =
        document.getElementById(
            "teacherClasses"
        );

    const editSelect =
        document.getElementById(
            "editClasses"
        );


    const options = data.classes.map(
        classItem => {

            const label =
                `${classItem.name}${
                    classItem.arm
                        ? " " + classItem.arm
                        : ""
                }`;

            return `

                <option value="${classItem.id}">
                    ${escapeHtml(label)}
                </option>

            `;

        }
    ).join("");


    if (select) {
        select.innerHTML = options;
    }

    if (editSelect) {
        editSelect.innerHTML = options;
    }

}


/* =========================================================
   RENDER TEACHERS
========================================================= */

function renderTeachers() {

    const tbody =
        document.getElementById(
            "teachersTableBody"
        );

    if (!tbody) return;


    if (!data.teachers.length) {

        tbody.innerHTML = `
            <tr>
                <td colspan="4">
                    No teachers added yet.
                </td>
            </tr>
        `;

        return;

    }


    tbody.innerHTML =
        data.teachers.map(teacher => {

            const subjectIds =
                Array.isArray(
                    teacher.subjectIds
                )
                    ? teacher.subjectIds
                    : teacher.subjectId
                        ? [teacher.subjectId]
                        : [];


            const subjects =
                subjectIds
                    .map(id =>

                        data.subjects.find(
                            subject =>
                                subject.id === id
                        )?.name

                    )
                    .filter(Boolean)
                    .join(", ");


            const classes =
                (
                    teacher.assignedClassIds ||
                    []
                )
                    .map(id => {

                        const classItem =
                            data.classes.find(
                                item =>
                                    item.id === id
                            );

                        if (!classItem) {
                            return "";
                        }

                        return (
                            classItem.name +
                            (
                                classItem.arm
                                    ? " " +
                                      classItem.arm
                                    : ""
                            )
                        );

                    })
                    .filter(Boolean)
                    .join(", ");


            return `

                <tr>

                    <td>
                        <strong>
                            ${escapeHtml(
                                teacher.name
                            )}
                        </strong>
                    </td>

                    <td>
                        ${escapeHtml(
                            subjects || "-"
                        )}
                    </td>

                    <td>
                        ${escapeHtml(
                            classes || "-"
                        )}
                    </td>

                    <td>

                        <button
                            type="button"
                            class="btn btn-secondary"
                            data-action="edit-teacher"
                            data-id="${teacher.id}"
                        >
                            Edit
                        </button>

                        <button
                            type="button"
                            class="btn btn-danger"
                            data-action="delete-teacher"
                            data-id="${teacher.id}"
                        >
                            Delete
                        </button>

                    </td>

                </tr>

            `;

        }).join("");


    tbody
        .querySelectorAll(
            '[data-action="edit-teacher"]'
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => editTeacher(
                    button.dataset.id
                )
            );

        });


    tbody
        .querySelectorAll(
            '[data-action="delete-teacher"]'
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => deleteTeacher(
                    button.dataset.id
                )
            );

        });

}


/* =========================================================
   RENDER PERIODS
========================================================= */

function renderPeriods() {

    const tbody =
        document.getElementById(
            "periodsTableBody"
        );

    if (!tbody) return;


    if (!data.periods.length) {

        tbody.innerHTML = `
            <tr>
                <td colspan="4">
                    No periods added yet.
                </td>
            </tr>
        `;

        return;

    }


    tbody.innerHTML =
        data.periods.map(period => `

            <tr>

                <td>
                    ${escapeHtml(period.name)}
                </td>

                <td>
                    ${escapeHtml(
                        period.startTime
                    )}
                </td>

                <td>
                    ${escapeHtml(
                        period.endTime
                    )}
                </td>

                <td>

                    <button
                        type="button"
                        class="btn btn-danger"
                        data-action="delete-period"
                        data-id="${period.id}"
                    >
                        Delete
                    </button>

                </td>

            </tr>

        `).join("");


    tbody
        .querySelectorAll(
            '[data-action="delete-period"]'
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => deletePeriod(
                    button.dataset.id
                )
            );

        });

}


/* =========================================================
   RENDER STATS
========================================================= */

function renderStats() {

    const classCount =
        document.getElementById(
            "classCount"
        );

    const subjectCount =
        document.getElementById(
            "subjectCount"
        );

    const teacherCount =
        document.getElementById(
            "teacherCount"
        );

    const periodCount =
        document.getElementById(
            "periodCount"
        );


    if (classCount) {
        classCount.textContent =
            data.classes.length;
    }

    if (subjectCount) {
        subjectCount.textContent =
            data.subjects.length;
    }

    if (teacherCount) {
        teacherCount.textContent =
            data.teachers.length;
    }

    if (periodCount) {
        periodCount.textContent =
            data.periods.length;
    }

}


/* =========================================================
   RENDER SETTINGS
========================================================= */

function renderSettings() {

    const schoolDays =
        document.getElementById(
            "schoolDays"
        );

    const maxAttempts =
        document.getElementById(
            "maxAttempts"
        );


    if (schoolDays) {

        schoolDays.value =
            data.settings.schoolDays || 5;

    }


    if (maxAttempts) {

        maxAttempts.value =
            data.settings.maxAttempts || 500;

    }

}


/* =========================================================
   CLASS SELECTOR
========================================================= */

function populateClassSelector() {

    const selector =
        document.getElementById(
            "classSelector"
        );

    if (!selector) return;


    const currentValue =
        selector.value;


    selector.innerHTML = `
        <option value="">
            Select a class
        </option>
    `;


    data.classes.forEach(
        classItem => {

            const option =
                document.createElement(
                    "option"
                );

            option.value =
                classItem.id;

            option.textContent =
                `${classItem.name}${
                    classItem.arm
                        ? " " + classItem.arm
                        : ""
                }`;

            selector.appendChild(
                option
            );

        }
    );


    if (
        currentValue &&
        data.classes.some(
            c => c.id === currentValue
        )
    ) {

        selector.value =
            currentValue;

    }

}


/* =========================================================
   DELETE CLASS
========================================================= */

async function deleteClass(id) {

    const classItem =
        data.classes.find(
            item => item.id === id
        );

    if (!classItem) return;


    const result =
        await Swal.fire({

            icon: "warning",

            title: "Delete Class?",

            text:
                `Delete ${classItem.name}${
                    classItem.arm
                        ? " " + classItem.arm
                        : ""
                }?`,

            showCancelButton: true,

            confirmButtonText:
                "Yes, Delete",

            cancelButtonText:
                "Cancel"

        });


    if (!result.isConfirmed) {
        return;
    }


    data.classes =
        data.classes.filter(
            item => item.id !== id
        );


    data.teachers =
        data.teachers.map(
            teacher => ({

                ...teacher,

                assignedClassIds:
                    (
                        teacher.assignedClassIds ||
                        []
                    ).filter(
                        classId =>
                            classId !== id
                    )

            })
        );


    data.timetable = {};

    saveData();

    renderAll();

    showSuccess(
        "Class Deleted"
    );

}


/* =========================================================
   DELETE SUBJECT
========================================================= */

async function deleteSubject(id) {

    const subject =
        data.subjects.find(
            item => item.id === id
        );

    if (!subject) return;


    const result =
        await Swal.fire({

            icon: "warning",

            title: "Delete Subject?",

            text:
                `Delete ${subject.name}?`,

            showCancelButton: true,

            confirmButtonText:
                "Yes, Delete",

            cancelButtonText:
                "Cancel"

        });


    if (!result.isConfirmed) {
        return;
    }


    data.subjects =
        data.subjects.filter(
            item => item.id !== id
        );


    data.teachers =
        data.teachers.map(
            teacher => ({

                ...teacher,

                subjectIds:
                    (
                        teacher.subjectIds ||
                        []
                    ).filter(
                        subjectId =>
                            subjectId !== id
                    )

            })
        );


    data.timetable = {};

    saveData();

    renderAll();

    showSuccess(
        "Subject Deleted"
    );

}


/* =========================================================
   DELETE TEACHER
========================================================= */

async function deleteTeacher(id) {

    const teacher =
        data.teachers.find(
            item => item.id === id
        );

    if (!teacher) return;


    const result =
        await Swal.fire({

            icon: "warning",

            title: "Delete Teacher?",

            text:
                `Delete ${teacher.name}?`,

            showCancelButton: true,

            confirmButtonText:
                "Yes, Delete",

            cancelButtonText:
                "Cancel"

        });


    if (!result.isConfirmed) {
        return;
    }


    data.teachers =
        data.teachers.filter(
            item => item.id !== id
        );


    data.timetable = {};

    saveData();

    renderAll();

    showSuccess(
        "Teacher Deleted"
    );

}


/* =========================================================
   DELETE PERIOD
========================================================= */

async function deletePeriod(id) {

    const period =
        data.periods.find(
            item => item.id === id
        );

    if (!period) return;


    const result =
        await Swal.fire({

            icon: "warning",

            title: "Delete Period?",

            text:
                `Delete ${period.name}?`,

            showCancelButton: true,

            confirmButtonText:
                "Yes, Delete",

            cancelButtonText:
                "Cancel"

        });


    if (!result.isConfirmed) {
        return;
    }


    data.periods =
        data.periods.filter(
            item => item.id !== id
        );


    data.timetable = {};

    saveData();

    renderAll();

    showSuccess(
        "Period Deleted"
    );

}


/* =========================================================
   EDIT TEACHER
========================================================= */

function editTeacher(id) {

    const teacher =
        data.teachers.find(
            item => item.id === id
        );

    if (!teacher) return;


    editingTeacherId = id;


    document
        .getElementById(
            "editTeacher"
        )
        .value =
            teacher.name || "";


    populateTeacherSubjectOptions();

    populateTeacherClassOptions();


    const subjectIds =
        Array.isArray(
            teacher.subjectIds
        )
            ? teacher.subjectIds
            : teacher.subjectId
                ? [teacher.subjectId]
                : [];


    const subjectSelect =
        document.getElementById(
            "editSubject"
        );


    const classSelect =
        document.getElementById(
            "editClasses"
        );


    Array.from(
        subjectSelect.options
    ).forEach(option => {

        option.selected =
            subjectIds.includes(
                option.value
            );

    });


    Array.from(
        classSelect.options
    ).forEach(option => {

        option.selected =
            (
                teacher.assignedClassIds ||
                []
            ).includes(
                option.value
            );

    });


    document
        .getElementById(
            "editModal"
        )
        .classList.remove(
            "hidden"
        );

}


/* =========================================================
   SAVE TEACHER EDIT
========================================================= */

function saveTeacherEdit() {

    if (!editingTeacherId) {
        return;
    }


    const teacher =
        data.teachers.find(
            item =>
                item.id ===
                editingTeacherId
        );


    if (!teacher) {
        return;
    }


    const name =
        document
            .getElementById(
                "editTeacher"
            )
            .value
            .trim();


    const subjectIds =
        getSelectedValues(
            document.getElementById(
                "editSubject"
            )
        );


    const assignedClassIds =
        getSelectedValues(
            document.getElementById(
                "editClasses"
            )
        );


    if (!name) {

        showWarning(
            "Teacher Name Required",
            "Please enter the teacher's name."
        );

        return;

    }


    if (!subjectIds.length) {

        showWarning(
            "Select Subjects",
            "Select at least one subject."
        );

        return;

    }


    if (!assignedClassIds.length) {

        showWarning(
            "Select Classes",
            "Select at least one class."
        );

        return;

    }


    teacher.name =
        name;

    teacher.subjectIds =
        subjectIds;

    teacher.assignedClassIds =
        assignedClassIds;


    data.timetable = {};

    saveData();

    closeTeacherModal();

    renderAll();

    showSuccess(
        "Teacher Updated"
    );

}


/* =========================================================
   CLOSE TEACHER MODAL
========================================================= */

function closeTeacherModal() {

    editingTeacherId = null;

    document
        .getElementById(
            "editModal"
        )
        ?.classList.add(
            "hidden"
        );

}


/* =========================================================
   ACTIVE DAYS
========================================================= */

function getActiveDays() {

    const numberOfDays =
        Number(
            data.settings.schoolDays
        ) || 5;

    return DAYS.slice(
        0,
        numberOfDays
    );

}


/* =========================================================
   GET ELIGIBLE TEACHERS
========================================================= */

function getEligibleTeachers(
    subjectId,
    classId
) {

    return data.teachers.filter(
        teacher => {

            const subjectIds =
                Array.isArray(
                    teacher.subjectIds
                )
                    ? teacher.subjectIds
                    : teacher.subjectId
                        ? [teacher.subjectId]
                        : [];


            const classIds =
                Array.isArray(
                    teacher.assignedClassIds
                )
                    ? teacher.assignedClassIds
                    : [];


            return (

                subjectIds.includes(
                    subjectId
                ) &&

                classIds.includes(
                    classId
                )

            );

        }
    );

}


/* =========================================================
   VALIDATE GENERATOR
========================================================= */

function validateTimetableSetup() {

    const errors = [];


    if (!data.classes.length) {

        errors.push(
            "Add at least one class."
        );

    }


    if (!data.subjects.length) {

        errors.push(
            "Add at least one subject."
        );

    }


    if (!data.teachers.length) {

        errors.push(
            "Add at least one teacher."
        );

    }


    if (!data.periods.length) {

        errors.push(
            "Add at least one period."
        );

    }


    if (errors.length) {
        return errors;
    }


    const activeDays =
        getActiveDays();


    const totalSlots =
        activeDays.length *
        data.periods.length;


    data.classes.forEach(
        classItem => {

            let requiredSlots = 0;


            data.subjects.forEach(
                subject => {

                    const frequency =
                        Number(
                            subject.weeklyFrequency
                        ) || 0;


                    requiredSlots +=
                        frequency;


                    const teachers =
                        getEligibleTeachers(
                            subject.id,
                            classItem.id
                        );


                    if (!teachers.length) {

                        const className =
                            `${classItem.name}${
                                classItem.arm
                                    ? " " +
                                      classItem.arm
                                    : ""
                            }`;


                        errors.push(
                            `${className}: No teacher is assigned to teach ${subject.name}.`
                        );

                    }

                }
            );


            if (
                requiredSlots >
                totalSlots
            ) {

                const className =
                    `${classItem.name}${
                        classItem.arm
                            ? " " +
                              classItem.arm
                            : ""
                    }`;


                errors.push(
                    `${className}: requires ${requiredSlots} periods, but only ${totalSlots} periods are available.`
                );

            }

        }
    );


    return errors;

}


/* =========================================================
   CREATE EMPTY TIMETABLE
========================================================= */

function createEmptyTimetable() {

    const timetable = {};


    data.classes.forEach(
        classItem => {

            timetable[
                classItem.id
            ] = {};


            getActiveDays().forEach(
                day => {

                    timetable[
                        classItem.id
                    ][day] = {};


                    data.periods.forEach(
                        (
                            period,
                            periodIndex
                        ) => {

                            timetable[
                                classItem.id
                            ][day][
                                periodIndex
                            ] = null;

                        }
                    );

                }
            );

        }
    );


    return timetable;

}


/* =========================================================
   TEACHER BUSY
========================================================= */

function isTeacherBusy(
    teacherBusy,
    teacherId,
    day,
    periodIndex
) {

    return Boolean(

        teacherBusy[
            teacherId
        ] &&

        teacherBusy[
            teacherId
        ][day] &&

        teacherBusy[
            teacherId
        ][day][
            periodIndex
        ]

    );

}


/* =========================================================
   SET TEACHER BUSY
========================================================= */

function setTeacherBusy(
    teacherBusy,
    teacherId,
    day,
    periodIndex,
    value
) {

    if (!teacherBusy[teacherId]) {

        teacherBusy[teacherId] = {};

    }


    if (!teacherBusy[teacherId][day]) {

        teacherBusy[teacherId][day] = {};

    }


    teacherBusy[
        teacherId
    ][day][
        periodIndex
    ] = value;

}


/* =========================================================
   CLASS SLOT
========================================================= */

function isClassSlotFree(
    timetable,
    classId,
    day,
    periodIndex
) {

    return !timetable[
        classId
    ]?.[day]?.[
        periodIndex
    ];

}


/* =========================================================
   COUNT SUBJECT ON DAY
========================================================= */

function countSubjectOnDay(
    timetable,
    classId,
    day,
    subjectId
) {

    let count = 0;


    const daySchedule =
        timetable[
            classId
        ]?.[day] || {};


    Object.values(
        daySchedule
    ).forEach(entry => {

        if (
            entry &&
            entry.subjectId ===
                subjectId
        ) {

            count++;

        }

    });


    return count;

}


/* =========================================================
   COUNT CLASS DAY LOAD
========================================================= */

function countClassDayLoad(
    timetable,
    classId,
    day
) {

    let count = 0;


    const daySchedule =
        timetable[
            classId
        ]?.[day] || {};


    Object.values(
        daySchedule
    ).forEach(entry => {

        if (entry) {
            count++;
        }

    });


    return count;

}


/* =========================================================
   SCORE CANDIDATE
========================================================= */

function scoreCandidate({
    subject,
    periodIndex,
    timetable,
    classId,
    day,
    teacherId,
    teacherLoad
}) {

    let score =
        Math.random() * 20;


    const subjectName =
        String(
            subject.name || ""
        )
            .trim()
            .toLowerCase();


    /* Mathematics morning preference */

    if (
        subjectName ===
        "mathematics"
    ) {

        if (periodIndex < 3) {

            score += 1000;

        }
        else {

            score -= 100;

        }

    }


    /* Spread subject across days */

    const subjectDayCount =
        countSubjectOnDay(
            timetable,
            classId,
            day,
            subject.id
        );


    if (
        subjectDayCount === 0
    ) {

        score += 250;

    }
    else {

        score -=
            subjectDayCount *
            150;

    }


    /* Prefer lighter days */

    const dayLoad =
        countClassDayLoad(
            timetable,
            classId,
            day
        );


    score -=
        dayLoad * 10;


    /* Prefer teachers with lighter load */

    score -=
        (
            teacherLoad[
                teacherId
            ] || 0
        ) * 2;


    return score;

}


/* =========================================================
   GENERATE ALL TIMETABLES
========================================================= */

async function generateTimetable() {

    const errors =
        validateTimetableSetup();


    if (errors.length) {

        showError(
            "Cannot Generate Timetable",
            errors
                .slice(0, 20)
                .map(
                    error =>
                        `<div style="margin-bottom:6px;">
                            ${escapeHtml(error)}
                        </div>`
                )
                .join("")
        );

        return;

    }


    const activeDays =
        getActiveDays();


    const timetable =
        createEmptyTimetable();


    const teacherBusy = {};

    const teacherLoad = {};


    data.teachers.forEach(
        teacher => {

            teacherBusy[
                teacher.id
            ] = {};

            teacherLoad[
                teacher.id
            ] = 0;

        }
    );


    /* -----------------------------------------------------
       CREATE LESSON TASKS
    ----------------------------------------------------- */

    const tasks = [];


    data.classes.forEach(
        classItem => {

            data.subjects.forEach(
                subject => {

                    const frequency =
                        Number(
                            subject.weeklyFrequency
                        ) || 0;


                    const teachers =
                        getEligibleTeachers(
                            subject.id,
                            classItem.id
                        );


                    for (
                        let occurrence = 0;
                        occurrence < frequency;
                        occurrence++
                    ) {

                        tasks.push({

                            classId:
                                classItem.id,

                            subjectId:
                                subject.id,

                            occurrence,

                            teacherCount:
                                teachers.length,

                            frequency

                        });

                    }

                }
            );

        }
    );


    /* -----------------------------------------------------
       HARDER TASKS FIRST
    ----------------------------------------------------- */

    tasks.sort(
        (a, b) => {

            if (
                a.teacherCount !==
                b.teacherCount
            ) {

                return (
                    a.teacherCount -
                    b.teacherCount
                );

            }


            if (
                a.frequency !==
                b.frequency
            ) {

                return (
                    b.frequency -
                    a.frequency
                );

            }


            const subjectA =
                data.subjects.find(
                    subject =>
                        subject.id ===
                        a.subjectId
                );


            const subjectB =
                data.subjects.find(
                    subject =>
                        subject.id ===
                        b.subjectId
                );


            const mathA =
                subjectA?.name
                    ?.trim()
                    .toLowerCase() ===
                "mathematics";


            const mathB =
                subjectB?.name
                    ?.trim()
                    .toLowerCase() ===
                "mathematics";


            if (
                mathA &&
                !mathB
            ) {

                return -1;

            }


            if (
                !mathA &&
                mathB
            ) {

                return 1;

            }


            return (
                Math.random() -
                0.5
            );

        }
    );


    /* -----------------------------------------------------
       BACKTRACKING
    ----------------------------------------------------- */

    let nodes = 0;


    const maxNodes =
        Math.max(
            20000,
            tasks.length * 3000
        );


    function solve(index) {

        nodes++;


        if (
            nodes >
            maxNodes
        ) {

            return false;

        }


        if (
            index >=
            tasks.length
        ) {

            return true;

        }


        const task =
            tasks[index];


        const subject =
            data.subjects.find(
                item =>
                    item.id ===
                    task.subjectId
            );


        if (!subject) {
            return false;
        }


        const eligibleTeachers =
            getEligibleTeachers(
                task.subjectId,
                task.classId
            );


        if (
            !eligibleTeachers.length
        ) {

            return false;

        }


        const candidates = [];


        /* -------------------------------------------------
           CREATE POSSIBLE COMBINATIONS
        ------------------------------------------------- */

        activeDays.forEach(
            day => {

                data.periods.forEach(
                    (
                        period,
                        periodIndex
                    ) => {

                        if (
                            !isClassSlotFree(
                                timetable,
                                task.classId,
                                day,
                                periodIndex
                            )
                        ) {

                            return;

                        }


                        eligibleTeachers.forEach(
                            teacher => {

                                if (
                                    isTeacherBusy(
                                        teacherBusy,
                                        teacher.id,
                                        day,
                                        periodIndex
                                    )
                                ) {

                                    return;

                                }


                                const score =
                                    scoreCandidate({
                                        subject,
                                        periodIndex,
                                        timetable,
                                        classId:
                                            task.classId,
                                        day,
                                        teacherId:
                                            teacher.id,
                                        teacherLoad
                                    });


                                candidates.push({

                                    day,

                                    periodIndex,

                                    teacher,

                                    score

                                });

                            }
                        );

                    }
                );

            }
        );


        if (
            !candidates.length
        ) {

            return false;

        }


        candidates.sort(
            (a, b) =>
                b.score -
                a.score
        );


        /* -------------------------------------------------
           TRY CANDIDATES
        ------------------------------------------------- */

        for (
            const candidate
            of candidates
        ) {

            const {
                day,
                periodIndex,
                teacher
            } = candidate;


            timetable[
                task.classId
            ][day][
                periodIndex
            ] = {

                subjectId:
                    task.subjectId,

                teacherId:
                    teacher.id

            };


            setTeacherBusy(
                teacherBusy,
                teacher.id,
                day,
                periodIndex,
                true
            );


            teacherLoad[
                teacher.id
            ] =
                (
                    teacherLoad[
                        teacher.id
                    ] || 0
                ) + 1;


            if (
                solve(
                    index + 1
                )
            ) {

                return true;

            }


            /* UNDO */

            timetable[
                task.classId
            ][day][
                periodIndex
            ] = null;


            setTeacherBusy(
                teacherBusy,
                teacher.id,
                day,
                periodIndex,
                false
            );


            teacherLoad[
                teacher.id
            ] =
                Math.max(
                    0,
                    (
                        teacherLoad[
                            teacher.id
                        ] || 1
                    ) - 1
                );

        }


        return false;

    }


    /* -----------------------------------------------------
       START GENERATION
    ----------------------------------------------------- */

    const success =
        solve(0);


    if (!success) {

        showError(
            "Timetable Could Not Be Generated",
            `
                <p>
                    The generator could not create
                    timetables for all classes with the
                    current settings.
                </p>

                <p>
                    Please check teacher assignments,
                    subject frequencies and available
                    periods.
                </p>

                <p>
                    A teacher can teach multiple subjects
                    and classes, but cannot teach two
                    classes at the same time.
                </p>
            `
        );

        return;

    }


    /* -----------------------------------------------------
       SAVE
    ----------------------------------------------------- */

    data.timetable =
        timetable;


    if (!saveData()) {
        return;
    }


    populateClassSelector();


    const selector =
        document.getElementById(
            "classSelector"
        );


    if (
        selector &&
        data.classes.length
    ) {

        selector.value =
            data.classes[0].id;

    }


    renderTimetable();


    setGeneratorMessage(
        `Timetables successfully generated for ${data.classes.length} classes.`
    );


    showSuccess(
        "Timetables Generated",
        `Timetables for all ${data.classes.length} classes have been generated successfully.`
    );

}


/* =========================================================
   GENERATOR MESSAGE
========================================================= */

function setGeneratorMessage(
    message
) {

    const element =
        document.getElementById(
            "generatorMessage"
        );


    if (!element) {
        return;
    }


    element.textContent =
        message;


    element.classList.remove(
        "hidden"
    );

}


/* =========================================================
   RENDER TIMETABLE
========================================================= */

function renderTimetable() {

    const container =
        document.getElementById(
            "timetableContainer"
        );


    const selector =
        document.getElementById(
            "classSelector"
        );


    if (!container) {
        return;
    }


    const classId =
        selector?.value || "";


    if (!classId) {

        container.innerHTML = `

            <div
                style="
                    padding:20px;
                    text-align:center;
                "
            >

                <p>
                    Select a class to view its timetable.
                </p>

            </div>

        `;

        return;

    }


    const selectedClass =
        data.classes.find(
            classItem =>
                classItem.id ===
                classId
        );


    if (!selectedClass) {

        container.innerHTML = `

            <div
                style="
                    padding:20px;
                    text-align:center;
                "
            >

                <p>
                    Class not found.
                </p>

            </div>

        `;

        return;

    }


    const schoolDays =
        Number(
            data.settings.schoolDays
        ) || 5;


    const activeDays =
        DAYS.slice(
            0,
            schoolDays
        );


    const classTimetable =
        data.timetable[
            classId
        ] || {};


    const classDisplayName =
        `${selectedClass.name}${
            selectedClass.arm
                ? " " +
                  selectedClass.arm
                : ""
        }`;


    let html = `

        <div class="timetable-heading">

            <h3>
                ${escapeHtml(
                    classDisplayName
                )}
                Timetable
            </h3>

            <p>
                ↔ Swipe left or right to view all periods
            </p>

        </div>


        <div class="timetable-scroll">

            <table class="timetable-table">

                <thead>

                    <tr>

                        <th class="day-column">
                            Day
                        </th>

    `;


    data.periods.forEach(
        period => {

            html += `

                <th>

                    ${escapeHtml(
                        period.name
                    )}

                    <small>

                        ${escapeHtml(
                            period.startTime
                        )}

                        -

                        ${escapeHtml(
                            period.endTime
                        )}

                    </small>

                </th>

            `;

        }
    );


    html += `

                    </tr>

                </thead>

                <tbody>

    `;


    activeDays.forEach(
        day => {

            html += `

                <tr>

                    <td class="day-column">

                        <strong>
                            ${escapeHtml(day)}
                        </strong>

                    </td>

            `;


            data.periods.forEach(
                (
                    period,
                    periodIndex
                ) => {

                    const entry =
                        classTimetable[
                            day
                        ]?.[
                            periodIndex
                        ] || null;


                    if (entry) {

                        const subject =
                            data.subjects.find(
                                item =>
                                    item.id ===
                                    entry.subjectId
                            );


                        const teacher =
                            data.teachers.find(
                                item =>
                                    item.id ===
                                    entry.teacherId
                            );


                        html += `

                            <td class="timetable-cell">

                                <strong>

                                    ${escapeHtml(
                                        subject
                                            ? subject.name
                                            : "Unknown Subject"
                                    )}

                                </strong>

                                <span>

                                    ${escapeHtml(
                                        teacher
                                            ? teacher.name
                                            : "No Teacher"
                                    )}

                                </span>

                            </td>

                        `;

                    }
                    else {

                        html += `

                            <td class="free-period">
                                Free
                            </td>

                        `;

                    }

                }
            );


            html += `

                </tr>

            `;

        }
    );


    html += `

                </tbody>

            </table>

        </div>

    `;


    container.innerHTML =
        html;

}


/* =========================================================
   PRINT
========================================================= */

function printTimetable() {

    if (
        !data.timetable ||
        !Object.keys(
            data.timetable
        ).length
    ) {

        showWarning(
            "No Timetable",
            "Generate the timetables before printing."
        );

        return;

    }


    window.print();

}


/* =========================================================
   LOAD SAMPLE DATA
========================================================= */

async function loadSampleData() {

    const result =
        await Swal.fire({

            icon: "question",

            title: "Load Sample Data?",

            text:
                "This will replace your current timetable data.",

            showCancelButton: true,

            confirmButtonText:
                "Yes, Load Sample",

            cancelButtonText:
                "Cancel"

        });


    if (!result.isConfirmed) {
        return;
    }


    const classes = [

        {
            id: generateId("class"),
            name: "JSS 1",
            arm: "A"
        },

        {
            id: generateId("class"),
            name: "JSS 2",
            arm: "A"
        },

        {
            id: generateId("class"),
            name: "JSS 3",
            arm: "A"
        },

        {
            id: generateId("class"),
            name: "SS 1",
            arm: "A"
        }

    ];


    const subjects = [

        {
            id: generateId("subject"),
            name: "Mathematics",
            code: "MTH",
            weeklyFrequency: 4
        },

        {
            id: generateId("subject"),
            name: "English Language",
            code: "ENG",
            weeklyFrequency: 4
        },

        {
            id: generateId("subject"),
            name: "Basic Science",
            code: "BSC",
            weeklyFrequency: 3
        },

        {
            id: generateId("subject"),
            name: "Social Studies",
            code: "SOS",
            weeklyFrequency: 3
        },

        {
            id: generateId("subject"),
            name: "Computer Studies",
            code: "ICT",
            weeklyFrequency: 2
        },

        {
            id: generateId("subject"),
            name: "Civic Education",
            code: "CIV",
            weeklyFrequency: 2
        },

        {
            id: generateId("subject"),
            name: "Agricultural Science",
            code: "AGR",
            weeklyFrequency: 2
        }

    ];


    const math =
        subjects.find(
            s => s.name === "Mathematics"
        ).id;


    const english =
        subjects.find(
            s => s.name === "English Language"
        ).id;


    const science =
        subjects.find(
            s => s.name === "Basic Science"
        ).id;


    const social =
        subjects.find(
            s => s.name === "Social Studies"
        ).id;


    const computer =
        subjects.find(
            s => s.name === "Computer Studies"
        ).id;


    const civic =
        subjects.find(
            s => s.name === "Civic Education"
        ).id;


    const agriculture =
        subjects.find(
            s => s.name === "Agricultural Science"
        ).id;


    const allClasses =
        classes.map(
            c => c.id
        );


    const jssClasses =
        classes
            .filter(
                c =>
                    c.name.startsWith(
                        "JSS"
                    )
            )
            .map(
                c => c.id
            );


    const teachers = [

        {
            id: generateId("teacher"),
            name: "John Doe",
            subjectIds: [
                math,
                science
            ],
            assignedClassIds:
                allClasses
        },

        {
            id: generateId("teacher"),
            name: "Mary James",
            subjectIds: [
                english,
                civic
            ],
            assignedClassIds:
                allClasses
        },

        {
            id: generateId("teacher"),
            name: "Peter Joseph",
            subjectIds: [
                social,
                agriculture
            ],
            assignedClassIds:
                jssClasses
        },

        {
            id: generateId("teacher"),
            name: "Grace David",
            subjectIds: [
                computer
            ],
            assignedClassIds:
                allClasses
        },

        {
            id: generateId("teacher"),
            name: "Daniel Paul",
            subjectIds: [
                social,
                agriculture
            ],
            assignedClassIds: [
                classes[3].id
            ]
        }

    ];


    const periods = [

        {
            id: generateId("period"),
            name: "Period 1",
            startTime: "08:00",
            endTime: "08:40"
        },

        {
            id: generateId("period"),
            name: "Period 2",
            startTime: "08:40",
            endTime: "09:20"
        },

        {
            id: generateId("period"),
            name: "Period 3",
            startTime: "09:20",
            endTime: "10:00"
        },

        {
            id: generateId("period"),
            name: "Period 4",
            startTime: "10:00",
            endTime: "10:40"
        },

        {
            id: generateId("period"),
            name: "Period 5",
            startTime: "11:00",
            endTime: "11:40"
        },

        {
            id: generateId("period"),
            name: "Period 6",
            startTime: "11:40",
            endTime: "12:20"
        },

        {
            id: generateId("period"),
            name: "Period 7",
            startTime: "12:20",
            endTime: "13:00"
        },

        {
            id: generateId("period"),
            name: "Period 8",
            startTime: "13:00",
            endTime: "13:40"
        }

    ];


    data = {

        school: {

            name:
                "Ebenezer Day Star Academy",

            session:
                "2026/2027",

            term:
                "First Term"

        },

        classes,

        subjects,

        teachers,

        periods,

        timetable: {},

        settings: {

            schoolDays: 5,

            maxAttempts: 500

        }

    };


    saveData();

    renderAll();


    showSuccess(
        "Sample Data Loaded",
        "Sample classes, subjects, teachers and periods have been added."
    );

}


/* =========================================================
   CLEAR ALL DATA
========================================================= */

async function clearAllData() {

    const result =
        await Swal.fire({

            icon: "warning",

            title: "Clear All Data?",

            text:
                "This will delete all classes, subjects, teachers, periods and timetables from this device.",

            showCancelButton: true,

            confirmButtonText:
                "Yes, Clear Everything",

            cancelButtonText:
                "Cancel",

            confirmButtonColor:
                "#d33"

        });


    if (!result.isConfirmed) {
        return;
    }


    data =
        JSON.parse(
            JSON.stringify(
                DEFAULT_DATA
            )
        );


    localStorage.removeItem(
        STORAGE_KEY
    );


    renderAll();


    showSuccess(
        "All Data Cleared"
    );

}