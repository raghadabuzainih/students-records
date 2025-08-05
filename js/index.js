const infoTable = document.querySelector('.info-table')
let data, translation, counts={}
let language = localStorage.getItem('language') ? localStorage.getItem('language') : 'en'
let sumGPA = 0.0
const avgGPA = document.querySelector('.avg-gpa')
const addButton = document.querySelector('.add')
const addForm = document.querySelector('.add-form')
const newSubmission = document.querySelector('.submit-new-record')
const blur = document.querySelector('.blur')
const nameSearch = document.querySelector('.name-search')
const majorSearch = document.querySelector('.major-search')
const inputLanguageAlert = document.querySelector('.input-language-alert')
const inputsToCheck = document.querySelectorAll('#name, #major, #editName,#editMajor')
const nullInputAlert = document.querySelector('.null-input-alert')
const filterInput = document.querySelector('.filter-input')
let filterOption //selected value from option set (filter option set)
const editAlert = document.querySelector('.confirm-edit')
let parent, parentIndex
const sortUpByName = document.querySelector('.sortup-name')
const sortDownByName = document.querySelector('.sortdown-name')
const sortUpByMajor = document.querySelector('.sortup-major')
const sortDownByMajor = document.querySelector('.sortdown-major')
const sortUpByGPA = document.querySelector('.sortup-gpa')
const sortDownByGPA = document.querySelector('.sortdown-gpa')
const countTable = document.querySelector('.count-table') //students by major table
let arabic = /[\u0600-\u06FF]/
let xValues = []
let yValues = [0, .5, 1, 1.5, 2, 2.5, 3, 3.5, 4]
let barColors = []
let myChart =new Chart("myChart", {
    type: "bar",
    data: {
        labels: xValues,
        datasets: [{
            backgroundColor: barColors,
            data: yValues
        }]
    },
    options: {
        legend: {display: false},
        title: {
            display: true,
            text: "Avg GPA"
        }
    }
})
const studentsNumber = document.querySelector('.students-number')
studentsNumber.textContent = 0

function setData(data){
    localStorage.setItem('data', JSON.stringify(data))
}

function setLanguage(language){
    localStorage.setItem('language', language)
}

async function startup(){
    try{
        data = JSON.parse(localStorage.getItem('data')) ? JSON.parse(localStorage.getItem('data')) : await getRecords()
        translation = await getTranslation()
        getTotalAvg()

        for(let item of data){
            addMajorCount(item['major'])
            if(checkWordAndLanguage(item.name)) studentsNumber.textContent = +studentsNumber.textContent+1
        }
        for(let key in counts){
            addNewMajorCountRow(key) //for 'students by major' table
            chart(key)
        }  
        setTranslation()
    }catch(err){
        console.error(err)
    }
}

startup()
for(let item of data){
    addNewRow(item) //for 'students records' table
}

function chart(key){
    if(checkWordAndLanguage(key)) xValues.unshift(key)
    else return
    countTable.querySelectorAll('.major-count-table').forEach(major =>{
        if(checkWordAndLanguage(key) && major.textContent == key){
            yValues.unshift(major.parentElement.querySelector('.avg-major').textContent)
            return
        }
    })
    if(barColors.length == 0) barColors.push('rgb(232, 95, 95)')
    else barColors[barColors.length] = barColors[barColors.length-1] == 'rgb(232, 95, 95)' ? 
                                        'rgb(25, 110, 25)' : 'rgb(232, 95, 95)'
    myChart.update()
}

async function getRecords(){
    try{
        let responce = await fetch('/data/students.json')
        let records = await responce.json()
        return records
    }catch(err){
        console.error(err)
        return []
    }
}

async function getTranslation(){
    try{
        let responce = await fetch('/data/languages.json')
        let translation = await responce.json()
        return translation
    }catch(err){
        console.error(err)
        return []
    }
}

//switch language button
const switchButton =document.querySelector('.switch-lan')
switchButton.addEventListener('click', (e)=>{
    e.preventDefault()
    language = language == 'en' ? 'ar' : 'en'
    setLanguage(language)
    setTranslation()
    location.reload()
})

function setTranslation(){
    document.querySelectorAll('[data-i18n]').forEach(element=>{
        element.textContent = translation[0][language][element.getAttribute('data-i18n')]
    })
    document.querySelectorAll('[data-i18n-placeholder]').forEach(element=>{
        element.setAttribute('placeholder', translation[0][language][element.getAttribute('data-i18n-placeholder')])
    })
    document.body.dir = language == 'ar' ? 'rtl' : 'ltr'
}

function addMajorCount(major){
    if(Object.keys(counts).includes(major)) counts[major] = counts[major]+1
    else counts[major] = 1
}

function checkWordAndLanguage(word){
    return arabic.test(word) && language == 'ar' || (!arabic.test(word) && language == 'en')
}

function getTotalAvg(){
    let count = 0
    for(let item of data){
        if(checkWordAndLanguage(item.name)){
            sumGPA += +item['gpa']
            avgGPA.textContent = (sumGPA/++count).toFixed(2) || 0
        }
    }
}

function addNewRow(item){
    let row = document.createElement('tr')
    for(let i=0; i<3; i++){
        let info = document.createElement('td')
        switch(i){
            case 0: 
                info.textContent = item['name']
                info.classList.add('name')
                break
            case 1:
                info.textContent = item['major']
                info.classList.add('major')
                break
            case 2:
                info.textContent = item['gpa']
                info.classList.add('gpa')
                break
        }
        row.appendChild(info)
    }
    let editButton = document.createElement('button')
    let editIcon = document.createElement('i')
    editIcon.className = 'fa-regular fa-pen-to-square'
    editButton.appendChild(editIcon)
    editButton.classList.add('edit')

    let deleteButton = document.createElement('button')
    let deleteIcon = document.createElement('i')
    deleteIcon.className = 'fa-solid fa-trash'
    deleteButton.appendChild(deleteIcon)
    deleteButton.classList.add('delete')
    row.appendChild(editButton)
    row.appendChild(deleteButton)
    row.className = `row-${data.indexOf(item)}`
    //check if row in english and language in arabic || or if row in arabic and language in english 
    if(!arabic.test(row.firstChild.textContent) && language == 'ar' || 
        (arabic.test(row.firstChild.textContent) && language == 'en')) row.style.display= 'none'
    infoTable.appendChild(row)
}

addButton.addEventListener('click', async(e)=>{
    e.preventDefault()
    addForm.style.display = 'grid'
    blur.style.display = 'block'
})

newSubmission.addEventListener('click',(e)=>{
    e.preventDefault()
    let item = {
        name: addForm.name.value,
        major: addForm.major.value,
        gpa: addForm.gpa.value
    }
    if(addForm.name.value == '' || addForm.major.value == '' || addForm.gpa.value == ''){
        nullInputAlert.style.display = 'block'
        blur.style.display = 'block'
        return
    }
    addForm.name.value = ''
    addForm.major.value = ''
    addForm.gpa.value = ''
    data = [...data, item]
    setData(data)
    addNewRow(item)
    addForm.style.display = 'none'
    blur.style.display = 'none'
    location.reload()
})

nameSearch.addEventListener('input', (e)=>{
    if(e.target.value != '') checkInputLanguage(e.target.value)
    showOrHideRows('name', e.target.value)
})

majorSearch.addEventListener('input', (e)=>{
    if(e.target.value != '') checkInputLanguage(e.target.value)
    showOrHideRows('major', e.target.value)
})

function showOrHideRows(column, inputValue){
    document.querySelectorAll(`.${column}`).forEach(x=>{
        if(inputValue == ''){
            if(checkWordAndLanguage(x.textContent)) x.parentElement.style.display = 'table-row'
            else x.parentElement.style.display = 'none'
        }
        else if(arabic.test(inputValue) && language == 'ar' && arabic.test(x.textContent) || 
                (!arabic.test(inputValue) && language == 'en' && !arabic.test(x.textContent))){
            if(x.textContent.toLowerCase().includes(inputValue.toLowerCase())){
                x.parentElement.style.display = 'table-row'
            }else x.parentElement.style.display = 'none'
        }else x.parentElement.style.display = 'none' //ex: if e.target.value in arabic & language in english
    })
}

function checkInputLanguage(value){
    if(arabic.test(value) && language=='en' ||
        (!arabic.test(value) && language=='ar')){
            inputLanguageAlert.style.display ='block'
            blur.style.display ='block'
    }
}

inputsToCheck.forEach(input => {
    input.addEventListener('input', (e) => {
        e.preventDefault()
        const val = e.target.value
        checkInputLanguage(val)
    })
})

document.querySelector('.cancel-input-alert').addEventListener('click', (e)=>{
    e.preventDefault()
    hideAlertAndBlur(nullInputAlert)
})

document.querySelector('.cancel-lang-alert').addEventListener('click', (e)=>{
    e.preventDefault()
    hideAlertAndBlur(inputLanguageAlert)
})

document.querySelector('.cancel-edit').addEventListener('click', (e)=>{
    e.preventDefault()
    hideAlertAndBlur(editAlert)
})

document.querySelector('.cancel-add-student').addEventListener('click', (e)=>{
    e.preventDefault()
    hideAlertAndBlur(addForm)
})

document.querySelector('.no').addEventListener('click', (e)=>{
    e.preventDefault()
    hideAlertAndBlur(deleteAlert)
})

function hideAlertAndBlur(alert){
    alert.style.display = 'none'
    blur.style.display = 'none'
}

document.querySelector('#filter-gpa').addEventListener('change', (e)=>{
    e.preventDefault()
    filterOption = e.target.value
    filter(+filterInput.value)
})

filterInput.addEventListener('input',(e)=>{
    e.preventDefault()
    filter(+e.target.value)
})

function filter(inputValue){
    infoTable.querySelectorAll('.gpa').forEach(x => {
        //it is enough to check the language of the first element in the row
        if(checkWordAndLanguage(x.parentElement.querySelector('.name').textContent)){
            if(+x.textContent == inputValue && filterOption == '=' ||
                (+x.textContent < inputValue && filterOption == '<') ||
                  (+x.textContent > inputValue && filterOption == '>')){
                    x.parentElement.style.display = "table-row"
            }else x.parentElement.style.display = "none"
        }else x.parentElement.style.display = "none"
    })
}

document.querySelectorAll('.edit').forEach(button=>{
    button.addEventListener('click', (e)=>{
        e.preventDefault()
        parent = button.parentElement
        parentIndex = parent.className.slice(4) //after row-..... there is a number --> index of the item
        editAlert.style.display = 'block'
        editAlert.querySelector('#editName').value = parent.querySelector('.name').textContent
        editAlert.querySelector('#editMajor').value = parent.querySelector('.major').textContent
        editAlert.querySelector('#editGPA').value = parent.querySelector('.gpa').textContent
        blur.style.display = 'block'
    })
})

document.querySelector('.save').addEventListener('click', (e)=>{
    e.preventDefault()
    let item = {
        name: editAlert.querySelector('#editName').value,
        major: editAlert.querySelector('#editMajor').value,
        gpa: editAlert.querySelector('#editGPA').value
    }
    data[parentIndex] = item
    setData(data)
    parent.querySelector('.name').textContent = item.name
    parent.querySelector('.major').textContent = item.major
    parent.querySelector('.gpa').textContent = item.gpa
    editAlert.style.display = 'none'
    blur.style.display = 'none'
    location.reload()
})

const deleteAlert = document.querySelector('.confirm-delete')
document.querySelectorAll('.delete').forEach(button=>{
    button.addEventListener('click', (e)=>{
        e.preventDefault()
        deleteAlert.style.display = 'block'
        blur.style.display = 'block'
        parent = button.parentElement
        parentIndex = parent.className.slice(4)
    })
})

document.querySelector('.yes').addEventListener('click', (e)=>{
    e.preventDefault()
    parent.remove()
    data.splice(parentIndex, 1)
    setData(data)
    location.reload()
})

function updateMajorAvgGPA(major){
    let sum = 0.0
    countTable.querySelectorAll('tr').forEach(row =>{
        if(row.firstChild.textContent == major){
            row.querySelector('.count-major').textContent = counts[major]
            document.querySelectorAll('.major').forEach(x =>{
                if(x.textContent == major) sum+= +x.parentElement.querySelector('.gpa').textContent
            })
            row.querySelector('.avg-major').textContent = (sum/counts[major]).toFixed(2)
        }         
    })
}

function addMajorCount(major){
    if(Object.keys(counts).includes(major)) counts[major] = counts[major]+1
    else counts[major] = 1
}

function addNewMajorCountRow(key){
    let row = document.createElement('tr')
    let major = document.createElement('td')
    major.textContent = key
    major.className= 'major-count-table'
    row.appendChild(major)
    let count = document.createElement('td')
    count.textContent = counts[key]
    count.className = 'count-major'
    let avg = document.createElement('td')
    avg.className = 'avg-major'
    let sum = 0.0
    document.querySelectorAll('.major').forEach(x =>{
        if(x.textContent == key) sum+= +x.parentElement.querySelector('.gpa').textContent
    })
    avg.textContent = (sum/counts[key]).toFixed(2)
    row.appendChild(count)
    row.appendChild(avg)
    if(!arabic.test(major.textContent) && language == 'ar' || (arabic.test(major.textContent) && language == 'en')){
        row.style.display = 'none'
    }
    countTable.appendChild(row)
}

function removeRowsAndInsertAfterSorting(){
    infoTable.querySelectorAll('tr').forEach(tr => {
        //tr.className = '' for the first row(it has titles of columns)
        if(tr.className != '') infoTable.querySelector(`.${tr.className}`).remove()
        //remove all rows then add them sorted in the below loop 
    })
    for(let i=0; i<data.length; i++){
        addNewRow(data[i])
    }
}

sortUpByName.addEventListener('click', (e)=>{
    e.preventDefault()
    //localeCompare --> for alphabetical sorting
    //if numeric sorting we use (-) for ex a.age - b.age
    data = data.sort((a,b)=> b.name.localeCompare(a.name))
    removeRowsAndInsertAfterSorting()
})

sortDownByName.addEventListener('click', (e)=>{
    e.preventDefault()
    data = data.sort((a,b)=> a.name.localeCompare(b.name))
    removeRowsAndInsertAfterSorting()
})

sortUpByMajor.addEventListener('click', (e)=>{
    e.preventDefault()
    data = data.sort((a,b)=> b.major.localeCompare(a.major))
    removeRowsAndInsertAfterSorting()
})

sortDownByMajor.addEventListener('click', (e)=>{
    e.preventDefault()
    data = data.sort((a,b)=> a.major.localeCompare(b.major))
    removeRowsAndInsertAfterSorting()
})

sortUpByGPA.addEventListener('click', (e)=>{
    e.preventDefault()
    data = data.sort((a,b)=> b.gpa - a.gpa)
    removeRowsAndInsertAfterSorting()
})

sortDownByGPA.addEventListener('click', (e)=>{
    e.preventDefault()
    data = data.sort((a,b)=> a.gpa - b.gpa)
    removeRowsAndInsertAfterSorting()
})