const infoTable = document.querySelector('.info-table')

function setData(data){
    localStorage.setItem('data', JSON.stringify(data))
}

let data, translation
let language = localStorage.getItem('language') ? localStorage.getItem('language') : 'en'
function setLanguage(language){
    localStorage.setItem('language', language)
}
let arabic = /[\u0600-\u06FF]/
const studentsNumber = document.querySelector('.students-number')
studentsNumber.textContent = 0

async function startup(){
    data = JSON.parse(localStorage.getItem('data')) ? JSON.parse(localStorage.getItem('data')) : await getRecords()
    translation = await getTranslation()
    getTotalAvg()

    for(let item of data){
        addMajorCount(item['major'])
        if(arabic.test(item.name) && language == 'ar' || (!arabic.test(item.name) && language == 'en')) studentsNumber.textContent = +studentsNumber.textContent+1
    }

    for(let key in counts){
        addNewMajorCountRow(key) //for 'students by major' table
    }
    
    setTranslation()
}

startup()
for(let item of data){
    addNewRow(item) //for 'students records' table
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

const switchButton =document.querySelector('.switch-lan')
switchButton.addEventListener('click', (e)=>{
    e.preventDefault()
    language = language == 'en' ? 'ar' : 'en'
    setLanguage(language)
    setTranslation()
    studentsNumber.textContent = 0
    sumGPA=0.0
    getTotalAvg()
    infoTable.querySelectorAll('tr').forEach(row => {
        if(row.className != ''){ //if it's not equal to first row because first row has titles and there is no class name for it
            if(arabic.test(row.firstChild.textContent) && language == 'ar' || (!arabic.test(row.firstChild.textContent) && language == 'en')){
                row.style.display = 'table-row'
                studentsNumber.textContent = +studentsNumber.textContent+1
            }
            else row.style.display = 'none'
        }else row.style.display = 'table-row'
    })
    countTable.querySelectorAll('tr').forEach(row => {
        if(row.firstChild.textContent != 'التخصص' || row.firstChild.textContent != 'Major'){
            if(arabic.test(row.firstChild.textContent) && language == 'ar' || (!arabic.test(row.firstChild.textContent) && language == 'en')){
                row.style.display = 'table-row'
            }else row.style.display = 'none'
        }else row.style.display = 'table-row'
    })
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

const avgGPA = document.querySelector('.avg-gpa')
let sumGPA = 0.0

//wanna count total students of each major
const countTable = document.querySelector('.count-table')

let counts = {}
function addMajorCount(major){
    if(Object.keys(counts).includes(major)) counts[major] = counts[major]+1
    else counts[major] = 1
}

function getTotalAvg(){
    let count = 0
    for(let item of data){
        if(arabic.test(item.name) && language == 'ar' || (!arabic.test(item.name) && language == 'en')){
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
    if(!arabic.test(row.firstChild.textContent) && language == 'ar' || (arabic.test(row.firstChild.textContent) && language == 'en')) row.style.display= 'none'
    infoTable.appendChild(row)
}

const addButton = document.querySelector('.add')
const addForm = document.querySelector('.add-form')
const blur = document.querySelector('.blur')
addButton.addEventListener('click', async(e)=>{
    e.preventDefault()
    addForm.style.display = 'grid'
    blur.style.display = 'block'
})

const newSubmission = document.querySelector('.submit-new-record')
newSubmission.addEventListener('click',(e)=>{
    e.preventDefault()
    let item = {
        name: addForm.name.value,
        major: addForm.major.value,
        gpa: addForm.gpa.value
    }
    if(addForm.name.value == '' || addForm.major.value == '' || addForm.gpa.value == ''){
        alert(translation[0][language]['Alert Message'])
        return
    }
    if(language == 'ar'){
        if(!arabic.test(item.name) || !arabic.test(item.major)){
            alert('اكتب باللغة العربية فقط')
            return
        }
    }else if(language == 'en'){
        if(arabic.test(item.name) || arabic.test(item.major)){
            alert('write english language')
            return
        }
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


const nameSearch = document.querySelector('.name-search')
const majorSearch = document.querySelector('.major-search')

nameSearch.addEventListener('input', (e)=>{
    document.querySelectorAll('.name').forEach(name=>{
        if(e.target.value == ''){
            if(language == 'ar' && arabic.test(name.textContent) || (language == 'en' && !arabic.test(name.textContent))) name.parentElement.style.display = 'table-row'
            else name.parentElement.style.display = 'none'
        }
        else if(arabic.test(e.target.value) && language == 'ar' && arabic.test(name.textContent) || 
                (!arabic.test(e.target.value) && language == 'en' && !arabic.test(name.textContent))){
            if(name.textContent.toLowerCase().includes(e.target.value.toLowerCase())) name.parentElement.style.display = 'table-row'
            else name.parentElement.style.display = 'none'
        }else name.parentElement.style.display = 'none' //ex: if e.target.value in arabic & language in english
    })
})

majorSearch.addEventListener('input', (e)=>{
    document.querySelectorAll('.major').forEach(major=>{
        if(e.target.value == ''){
            if(language == 'ar' && arabic.test(major.textContent) || (language == 'en' && !arabic.test(major.textContent))) major.parentElement.style.display = 'table-row'
            else major.parentElement.style.display = 'none'
        }
        else if(arabic.test(e.target.value) && language == 'ar' && arabic.test(major.textContent) || 
                (!arabic.test(e.target.value) && language == 'en' && !arabic.test(major.textContent))){
            if(major.textContent.toLowerCase().includes(e.target.value.toLowerCase())) major.parentElement.style.display = 'table-row'
            else major.parentElement.style.display = 'none'
        }else major.parentElement.style.display = 'none'
    })
})

const filterInput = document.querySelector('.filter-input')
document.querySelector('.filterup').addEventListener('click',(e)=>{
    e.preventDefault()
    if(+filterInput.value >= 0 && +filterInput.value <= 4){
        infoTable.querySelectorAll('.gpa').forEach(x => {
            if(+x.textContent < +filterInput.value || 
                (language == 'ar' && !arabic.test(x.parentElement.querySelector('.name').textContent))
                || (language == 'en' && arabic.test(x.parentElement.querySelector('.name').textContent)))
            {
                x.parentElement.style.display = "none"
            }
            else x.parentElement.style.display = "table-row"
        })
    }
})

document.querySelector('.filterdown').addEventListener('click',(e)=>{
    e.preventDefault()
    if(+filterInput.value >= 0 && +filterInput.value <= 4){
        infoTable.querySelectorAll('.gpa').forEach(x => {
            if(+x.textContent >= +filterInput.value || 
                (language == 'ar' && !arabic.test(x.parentElement.querySelector('.name').textContent))
                || (language == 'en' && arabic.test(x.parentElement.querySelector('.name').textContent)))
            {
                 x.parentElement.style.display = "none"
            }
            else x.parentElement.style.display = "table-row"
        })
    }
})

filterInput.addEventListener('input',(e)=>{
    e.preventDefault()
    if(e.target.value == ''){
        infoTable.querySelectorAll('tr').forEach(row => {
            if(row.className == '' || (arabic.test(row.firstChild.textContent) && language == 'ar') || (!arabic.test(row.firstChild.textContent) && language == 'en')){
                row.style.display = 'table-row'
            }else row.style.display = 'none'
        })
    }
})

const editAlert = document.querySelector('.confirm-edit')
let parent, parentIndex
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
    if(item.name == '' || item.major == '' || item.gpa == ''){
        alert(translation[0][language]['Alert Message'])
        return
    }
    if(language == 'ar'){
        if(!arabic.test(item.name) || !arabic.test(item.major) || !arabic.test(item.gpa)){
            alert('اكتب باللغة العربية فقط')
            return
        }
    }else if(language == 'en'){
        if(arabic.test(item.name) || arabic.test(item.major) || arabic.test(item.gpa)){
            alert('write english language')
            return
        }
    }
    parent.querySelector('.name').textContent = item.name
    parent.querySelector('.major').textContent = item.major
    parent.querySelector('.gpa').textContent = item.gpa
    editAlert.style.display = 'none'
    blur.style.display = 'none'
    location.reload() //to updat
})

document.querySelector('.cancel-edit').addEventListener('click', (e)=>{
    e.preventDefault()
    editAlert.style.display = 'none'
    blur.style.display = 'none'
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

document.querySelector('.no').addEventListener('click', (e)=>{
    e.preventDefault()
    deleteAlert.style.display = 'none'
    blur.style.display = 'none'
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

document.querySelector('.cancel').addEventListener('click', (e)=>{
    e.preventDefault()
    addForm.style.display = 'none'
    blur.style.display = 'none'
})

function addMajorCount(major){
    if(Object.keys(counts).includes(major)) counts[major] = counts[major]+1
    else counts[major] = 1
}

function addNewMajorCountRow(key){
    let row = document.createElement('tr')
    let major = document.createElement('td')
    major.textContent = key
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
    if(!arabic.test(major.textContent) && language == 'ar' || (arabic.test(major.textContent) && language == 'en')) row.style.display = 'none'
    countTable.appendChild(row)
}

const sortUpByName = document.querySelector('.sortup-name')
sortUpByName.addEventListener('click', (e)=>{
    e.preventDefault()
    //localeCompare --> for alphabetical sorting
    //if numeric sorting we use (-) for ex a.age - b.age
    data = data.sort((a,b)=> b.name.localeCompare(a.name))
    infoTable.querySelectorAll('tr').forEach(tr => {
        //tr.className = '' for the first row(it has titles of columns)
        if(tr.className != '') infoTable.querySelector(`.${tr.className}`).remove()
    })
    for(let i=0; i<data.length; i++){
        addNewRow(data[i])
    }
})

const sortDownByName = document.querySelector('.sortdown-name')
sortDownByName.addEventListener('click', (e)=>{
    e.preventDefault()
    data = data.sort((a,b)=> a.name.localeCompare(b.name))
    infoTable.querySelectorAll('tr').forEach(tr => {
        if(tr.className != '') infoTable.querySelector(`.${tr.className}`).remove()
    })
    for(let i=0; i<data.length; i++){
        addNewRow(data[i])
    }
})

const sortUpByMajor = document.querySelector('.sortup-major')
sortUpByMajor.addEventListener('click', (e)=>{
    e.preventDefault()
    //localeCompare --> for alphabetical sorting
    //if numeric sorting we use (-) for ex a.age - b.age
    data = data.sort((a,b)=> b.major.localeCompare(a.major))
    infoTable.querySelectorAll('tr').forEach(tr => {
        //tr.className = '' for the first row(it has titles of columns)
        if(tr.className != '') infoTable.querySelector(`.${tr.className}`).remove()
    })
    for(let i=0; i<data.length; i++){
        addNewRow(data[i])
    }
})

const sortDownByMajor = document.querySelector('.sortdown-major')
sortDownByMajor.addEventListener('click', (e)=>{
    e.preventDefault()
    data = data.sort((a,b)=> a.major.localeCompare(b.major))
    infoTable.querySelectorAll('tr').forEach(tr => {
        if(tr.className != '') infoTable.querySelector(`.${tr.className}`).remove()
    })
    for(let i=0; i<data.length; i++){
        addNewRow(data[i])
    }
})

const sortUpByGPA = document.querySelector('.sortup-gpa')
sortUpByGPA.addEventListener('click', (e)=>{
    e.preventDefault()
    data = data.sort((a,b)=> b.gpa - a.gpa)
    infoTable.querySelectorAll('tr').forEach(tr => {
        if(tr.className != '') infoTable.querySelector(`.${tr.className}`).remove()
    })
    for(let i=0; i<data.length; i++){
        addNewRow(data[i])
    }
})

const sortDownByGPA = document.querySelector('.sortdown-gpa')
sortDownByGPA.addEventListener('click', (e)=>{
    e.preventDefault()
    data = data.sort((a,b)=> a.gpa - b.gpa)
    infoTable.querySelectorAll('tr').forEach(tr => {
        if(tr.className != '') infoTable.querySelector(`.${tr.className}`).remove()
    })
    for(let i=0; i<data.length; i++){
        addNewRow(data[i])
    }
})