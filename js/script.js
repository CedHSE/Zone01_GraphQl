const loginAPI = "https://zone01normandie.org/api/auth/signin";
const graphqlAPI = "https://zone01normandie.org/api/graphql-engine/v1/graphql";

let userInfos;
let allTransactInfo;

document.addEventListener("DOMContentLoaded", function() {
    document.getElementById("submitButton").addEventListener("click", function() {
        const password = document.getElementById("password");
        const username = document.getElementById("username");
        credentials.password = password.value;
        credentials.username = username.value;
        fetchZone01();
    });
});

const credentials = {
    username: '',
    password: '',
};

let JWT;

function fetchZone01(){
    let login = async function () {
        const headers = new Headers();
        headers.append('Authorization', 'Basic ' + btoa(credentials.username + ':' + credentials.password));
        try {
          const response = await fetch(loginAPI, {
            method: 'POST',
            headers: headers
          });
          const token = await response.json();
          if (response.ok) {
            console.log("ok" ,response)
            JWT = token;
        
            console.log(JWT)
            fetchUserData();
          } else {
            console.log("no", token.message);
            ShowError()
          }
        } catch (error) {
          console.error('Error:', error);
        }
    };
    login();
}

let timeout;
function ShowError(){
    clearTimeout(timeout);
    const error = document.getElementById("errorMessage");
    error.textContent="The password you entered does not match the username provided."
    timeout = setTimeout(()=>{
        error.textContent=""
    },5000);
}

async function fetchUserData() {

    fetch(graphqlAPI, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${JWT}`
        },
        body: JSON.stringify({
            query: `
        query {
            user {
                id
                login
                attrs
                totalUp
                totalDown
                transactions ( where: {eventId: {_eq: 148}}, order_by: {createdAt:asc}){
                amount
                type
                createdAt
                }
            }
            transaction{
                id
                type
                amount 	
                objectId 	
                userId 	
                createdAt 	
                path
            }
        }`
        })
    })
    .then(response => response.json())
    .then(data => {
        console.log(data.data.user[0]);
        userInfos = data.data.user[0];
        allTransactInfo = data.data.transaction;
        createProfilPageUser();
    })
    .catch(error => {
        console.error("Error retrieving user data:", error);
    });

}

async function createProfilPageUser(){
    if (userInfos){
        const contentPage = document.getElementById("all");
        contentPage.innerHTML = "";
        await 
        profilUser(contentPage)
        generateGraphLinear();
        generateGraphBar(); 
        console.log(transactSkill())
        createRadarChart(transactSkill());
        disconnectButton()
    }
}

function profilUser(contentPage){

    const infoUserData = document.createElement("div");
    infoUserData.className="userWelcome";
    infoUserData.textContent = `Welcome, ${userInfos.attrs.firstName}! `;

    const infoUserID = document.createElement("div");
    infoUserID.className="userData";
    infoUserID.textContent=`id: ${userInfos.id}`;

    const infoUserLog = document.createElement("div");
    infoUserLog.className="userData";
    infoUserLog.textContent=`Username: ${userInfos.login}`;

    const infoPhone = document.createElement("div");
    infoPhone.className="userData";
    infoPhone.textContent=`Cell: ${userInfos.attrs.Phone}`;

    const infoUserMail = document.createElement("div");
    infoUserMail.className="userData";
    infoUserMail.textContent=`Mail: ${userInfos.attrs.email}`;

    const infoGender = document.createElement("div");
    infoGender.className="userData";
    infoGender.textContent=`Gender: ${userInfos.attrs.gender}`;

    const infoAdressStreet = document.createElement("div");
    infoAdressStreet.className="userData";
    infoAdressStreet.textContent=`Address: ${userInfos.attrs.addressStreet}`;

    const motivation = document.createElement("div");
    motivation.className="userData";
    motivation.textContent=`Catch phrase: "${userInfos.attrs.attentes}"`;

    const levelUser = document.createElement("div");
    levelUser.className = "userData";
    levelUser.textContent= `Level: ${foundLevelUser()}`;

    contentPage.appendChild(infoUserData);
    contentPage.appendChild(infoUserID);
    contentPage.appendChild(infoUserLog);
    contentPage.appendChild(levelUser);
    contentPage.appendChild(infoPhone);
    contentPage.appendChild(infoUserMail);
    contentPage.appendChild(infoGender);
    contentPage.appendChild(infoAdressStreet);
    contentPage.appendChild(motivation);
}

function foundLevelUser(){

    let level;

    for (let i = 0; i < userInfos.transactions.length-1; i++){
        if (userInfos.transactions[i].type === "level"){
            level = userInfos.transactions[i].amount
        }
    }

    return level
}


function transactionsEXP(){
    let array = [];
    for(let i = 0; i < userInfos.transactions.length-1; i++){
        if (userInfos.transactions[i].type ==="xp"){
            array.push(Number(userInfos.transactions[i].amount))
        }
    }
    return array
}


function generateGraphLinear() {

    const xpAlltransact = document.createElement("div");
    xpAlltransact.className="graphDiv";

    const xpAmount= document.createElement("div");
    xpAmount.className="userInfos";
    xpAmount.textContent=`Number of transactions made: ${transactionsEXP().length}\n`

    const maxAmount = Math.max(...transactionsEXP());
    const minAmount = Math.min(...transactionsEXP());
    let sommeOfAllValues = transactionsEXP().reduce((acc, curr) => acc + curr, 0);

    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", 1200);
    svg.setAttribute("height", 400);
    svg.style.boxShadow = "0 0 0 3px steelblue";
    
    for (let i = 0; i <= 9; i++) {
        if (i === 0 ){
            const y = 400 - i * 40;
            const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
            text.setAttribute("x", 0);
            text.setAttribute("y", y);
            text.setAttribute("fill", "white");
            text.textContent = i * 100;
            svg.appendChild(text);
        }else if(i===6){
            const y = 400 - i * 40;
            const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
            text.setAttribute("x", 0);
            text.setAttribute("y", y);
            text.setAttribute("fill", "white");
            text.textContent = `Total Exp: ${sommeOfAllValues}`; 
            svg.appendChild(text);
        }else if(i===7){
            const y = 400 - i * 40;
            const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
            text.setAttribute("x", 0);
            text.setAttribute("y", y );
            text.setAttribute("fill", "white");
            text.textContent =`Smallest transaction ---> ${minAmount}`;
            svg.appendChild(text);
        }else if(i===8){
            const sum = transactionsEXP().reduce((acc, curr) => acc + curr, 0);
            const average = sum / transactionsEXP().length;
            const roundedAverage = Math.round(average * 100) / 100;
            const y = 400 - i * 40;
            const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
            text.setAttribute("x", 0);
            text.setAttribute("y", y );
            text.setAttribute("fill", "white");
            text.textContent =`Average transaction ---> ${roundedAverage}`;
            svg.appendChild(text);
        }else if(i === 9){
            const y = 400 - i * 40;
            const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
            text.setAttribute("x", 0);
            text.setAttribute("y", y );
            text.setAttribute("fill", "white");
            text.textContent =`Biggest transaction ---> ${maxAmount}`;
            svg.appendChild(text);
        }
    }

    const line = document.createElementNS("http://www.w3.org/2000/svg", "polyline");

    let amountValue = 0;

    const points = transactionsEXP().map((value, index) => {
        amountValue = amountValue+value
        const x = index * 20; 
        const y = 400 - (amountValue / sommeOfAllValues) * 400; 
        return `${x},${y}`;
    }).join(" ");

    line.setAttribute("points", points);
    line.setAttribute("fill", "none");
    line.setAttribute("stroke", "steelblue");
    line.setAttribute("stroke-width", 2);

    svg.appendChild(line);


    xpAlltransact.appendChild(xpAmount)
    xpAlltransact.appendChild(svg)
    document.getElementById("all").appendChild(xpAlltransact);

}

function generateGraphBar() {
    const data = transactPointAudits();
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", 600);
    svg.setAttribute("height", 400);
    svg.style.boxShadow = "0 0 0 3px steelblue";

    const xpAlltransact = document.createElement("div");
    xpAlltransact.className="graphDiv";

    const auditAllTarnsact = document.createElement("div");
    auditAllTarnsact.className="userInfos";
    auditAllTarnsact.textContent=`Number of audits made: ${data.length}\n`;

    xpAlltransact.appendChild(auditAllTarnsact);
    xpAlltransact.appendChild(svg);
    const chartWidth = 600;
    const chartHeight = 400;
    const barWidth = chartWidth / data.length;

    const maxValue = Math.max(...data.map(item => Math.abs(item.amount)));

    const dataBig = data.filter((value)=> value.amount=== maxValue)

    for (let i = 0; i <= 9; i++) {
        if (i === 9 ){
            const y = 400 - i * 40;
            const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
            text.setAttribute("x", 0);
            text.setAttribute("y", y);
            text.setAttribute("fill", "white");
            text.textContent = `Biggest audit ---> ${dataBig[0].path} ,`;
            svg.appendChild(text);
        }else if (i===8){
            const y = 400 - i * 40;
            const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
            text.setAttribute("x", 0);
            text.setAttribute("y", y);
            text.setAttribute("fill", "white");
            text.textContent = `for ${dataBig[0].amount} exp`;
            svg.appendChild(text);
        }
    }

    data.forEach((value, index) => {
        let barHeight = (Math.abs(value.amount) / maxValue) * chartHeight;
        if (value.type === "down") {
            barHeight *= -1;
        }
        const x = index * barWidth;
        const y = chartHeight - Math.max(0, Math.abs(barHeight)); 
    
        const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        rect.setAttribute("x", x);
        rect.setAttribute("y", y);
        rect.setAttribute("width", barWidth);
        rect.setAttribute("height", Math.abs(barHeight));
        rect.setAttribute("fill", value.type === "up" ? "green" : "red");
    
        svg.appendChild(rect);
    });    

    document.getElementById("all").appendChild(xpAlltransact)

}

function transactPointAudits(){
    let array = [];
    for(let i = 0; i < allTransactInfo.length-1; i++){
        let transact = allTransactInfo[i].type;
        if (transact === "up" || transact === "down"){
            array.push(allTransactInfo[i])
        }
    }
    return array
}

function transactSkill(){
    let obj1 ={
        amount: 0,
        createdAt: "",
        id: 0,
        objectId: 0,
        path: "",
        type: "",
        userId: 0
    }
    let obj = {
        go : obj1,
        js : obj1,
        algo : obj1,
        front : obj1,
        back : obj1,
        prog : obj1
    }
    for(let i = 0; i < allTransactInfo.length-1; i++){
        let transact = allTransactInfo[i].type;
        switch (transact){
            case "skill_prog":
                if (allTransactInfo[i].amount > obj.prog.amount){
                    obj.prog = allTransactInfo[i];
                }
                break
            
            case "skill_go":
                if (allTransactInfo[i].amount > obj.go.amount){
                    obj.go = allTransactInfo[i];
                }
                break

            case "skill_js":
                if (allTransactInfo[i].amount > obj.js.amount){
                    obj.js = allTransactInfo[i];
                }
                break

            case "skill_front-end":
                if (allTransactInfo[i].amount > obj.front.amount){
                    obj.front = allTransactInfo[i];
                }
                break

            case "skill_back-end":
                if (allTransactInfo[i].amount > obj.back.amount){
                    obj.back = allTransactInfo[i];
                }
                break

            case "skill_algo":
                if (allTransactInfo[i].amount > obj.algo.amount){
                    obj.algo = allTransactInfo[i];
                }
                break
            default:
                break
        }
    }
    let array = [];
    array.push(obj.algo);
    array.push(obj.back);
    array.push(obj.front);
    array.push(obj.go);
    array.push(obj.js);
    array.push(obj.prog);
    return array
}

function createRadarChart(data) {

    const skillInfo = document.createElement("div");
    skillInfo.className = "graphDiv";
    skillInfo.textContent = `Skills: `;
    document.getElementById("all").appendChild(skillInfo);

    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", 600);
    svg.setAttribute("height", 400);

    const width = 600;
    const height = 400;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 2 - 20;

    const labelOffset = 25;

    data.forEach((value, index) => {
        const angle = (Math.PI * 2 * index) / data.length;
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);

        const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line.setAttribute("x1", centerX);
        line.setAttribute("y1", centerY);
        line.setAttribute("x2", x);
        line.setAttribute("y2", y);
        line.setAttribute("stroke", "rgba(255, 255, 255, 0.5)");
        line.setAttribute("stroke-width", 2);
        svg.appendChild(line);

        const labelX = centerX + (radius + labelOffset) * Math.cos(angle);
        const labelY = centerY + (radius + labelOffset) * Math.sin(angle);

        const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
        label.setAttribute("x", labelX);
        label.setAttribute("y", labelY);
        label.setAttribute("fill", "white");
        label.setAttribute("font-size", "14px");
        label.setAttribute("text-anchor", "middle");
        label.setAttribute("alignment-baseline", "middle");

        const skillName = value.type.replace("skill_", "");
        label.textContent = `${skillName} : ${value.amount}`;
        svg.appendChild(label);
    });

    const polyPoints = data.map((value, index) => {
        const angle = (Math.PI * 2 * index) / data.length;
        const x = centerX + (radius * value.amount) / 100 * Math.cos(angle);
        const y = centerY + (radius * value.amount) / 100 * Math.sin(angle);
        return `${x},${y}`;
    });
    const polygon = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
    polygon.setAttribute("points", polyPoints.join(" "));
    polygon.setAttribute("fill", "rgba(255, 0, 0, 0.5)");
    svg.appendChild(polygon);

    document.getElementById("all").appendChild(svg);
}

async function disconnectButton() {
    const boutonRefresh = document.createElement("button");
    boutonRefresh.textContent = "Disconnect";
    boutonRefresh.className = "disconnectButton";

    boutonRefresh.addEventListener("click", function() {
        window.location.reload();
    });

    document.getElementById("all").appendChild(boutonRefresh)
}
