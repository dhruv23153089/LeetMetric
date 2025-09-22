document.addEventListener("DOMContentLoaded", function() {
    const searchButton = document.getElementById("search-btn");
    const usernameInput = document.getElementById("user-input");
    const statsContainer = document.querySelector(".stats-container");
    const easyProgressCircle = document.querySelector(".easy-progress");
    const mediumProgressCircle = document.querySelector(".medium-progress");
    const hardProgressCircle = document.querySelector(".hard-progress");      
    const easyLabel = document.getElementById("easy-label"); 
    const mediumLabel = document.getElementById("medium-label");
    const hardLabel = document.getElementById("hard-label");
    const cardStatsContainer = document.querySelector(".stats-cards");
   
    function validateUsername(username) {
        if(username.trim() === "") {
            alert("Username cannot be empty.");
            return false;
        }
        const regex = /^[a-zA-Z0-9_]{1,20}$/;
        const isMatch = regex.test(username);
        if (!isMatch) {
            alert("Invalid username. It should be 1-20 characters long and can only contain letters, numbers, and underscores."); }
        return isMatch;}

    async function fetchUserDetails(username) {
      
        try{
            searchButton.textContent = "Searching...";
            searchButton.disabled = true;
            statsContainer.style.display = "none";
         

            const proxyUrl = 'https://cors-anywhere.herokuapp.com/';
            const targetUrl = 'https://leetcode.com/graphql';
            const myHeaders = new Headers();
            myHeaders.append("Content-Type", "application/json");

            const graphql = JSON.stringify({
                query: "\n        query userSessionProgress($username: String!) {\n allQuestionsCount {\n   difficulty\n count\n }\n matchedUser(username: $username) {\n  submitStats {\n  acSubmissionNum { \n difficulty\n count\n submissions\n} \n totalSubmissionNum {\n difficulty\n count\n submissions\n }\n } \n }\n }",
                variables: { "username": `${username }`}  
            })
            const requestOptions = {
                method: 'POST',
                headers: myHeaders,
                body: graphql,
                redirect: 'follow'
            };
            const response = await fetch(proxyUrl+targetUrl, requestOptions);
            
            
            if (!response.ok) {
                throw new Error("User not found");
            }       
            const info = await response.json();
            console.log("User details:", info);

            statsContainer.style.display = "block";
            displayUserStats(info);
        }
        catch (error){
          statsContainer.innerHTML = `<p class="error-message">Error: ${error.message}</p>`;
        }
        finally{
            searchButton.textContent = "Search";
            searchButton.disabled = false;

        }
    }

    function updateProgressCircle(total, circle, progress, label) {
        const percentage = (progress / total) * 100;
        circle.style.setProperty('--progress-degree', `${percentage}%`);
        label.textContent = `${progress} / ${total}`;

    }


    function displayUserStats(info) {
        const totalQues = info.data.allQuestionsCount[0].count;
        const easyProgress = info.data.allQuestionsCount[1].count;
        const mediumProgress = info.data.allQuestionsCount[2].count;
        const hardProgress = info.data.allQuestionsCount[3].count;

        const user = info.data.matchedUser;
        if (!user) {
         easyProgressCircle.style.setProperty('--progress-degree', `0%`);
        mediumProgressCircle.style.setProperty('--progress-degree', `0%`);
        hardProgressCircle.style.setProperty('--progress-degree', `0%`);
        easyLabel.textContent = `0 / ${easyProgress}`;
        mediumLabel.textContent = `0 / ${mediumProgress}`;
        hardLabel.textContent = `0 / ${hardProgress}`;
        cardStatsContainer.innerHTML = `<p class="error-message">User not found.</p>`;
        return;
       }

        // const user = info.data.matchedUser;
        const solvedTotal = user.submitStats.acSubmissionNum[0].count;
        const easyCount = user.submitStats.acSubmissionNum[1].count;
        const mediumCount = user.submitStats.acSubmissionNum[2].count;
        const hardCount = user.submitStats.acSubmissionNum[3].count;

        updateProgressCircle(easyProgress, easyProgressCircle, easyCount, easyLabel);
        updateProgressCircle(mediumProgress, mediumProgressCircle, mediumCount, mediumLabel);
        updateProgressCircle(hardProgress, hardProgressCircle, hardCount, hardLabel);

        const cardsData = [
            { title: "Total Questions", value: totalQues },
            { title: "Solved Questions", value: solvedTotal },
            { title: "Easy Questions Solved", value: easyCount },
            { title: "Medium Questions Solved", value: mediumCount },
            { title: "Hard Questions Solved", value: hardCount }
        ];


        cardStatsContainer.innerHTML = cardsData.map(
            data =>{return `
            <div class="card">
                <h4>${data.title}</h4>
                <p>${data.value}</p>
            </div>
             `;
            }).join("")
    }
        searchButton.addEventListener("click", function() {
            const username = usernameInput.value.trim();
            console.log("Searching for user:", username);
            if (validateUsername(username)) {
                fetchUserDetails(username);
            }
        });
    });