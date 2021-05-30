const url = 'https://api.github.com/graphql';

// Remember to generate your github token and insert here
const ghToken = "";


const isLoadedText = document.getElementById("is-loaded");
const isLoadingText = document.getElementById("is-loading");
const repositoryContainer = document.getElementById("repositories");

const submitButton = document.getElementById("search-button");
const searchInputBox = document.getElementById("username-input");

const usernameElement = document.getElementById("user-name");
const loginNameElement = document.getElementById("login-name");
const avatarImgElement = document.getElementById("avatar-image");
const bioDescElement = document.getElementById("bio-description");
const profileImgElement = document.getElementById("profile-image");


const query = `
  query($username: String!) {
    user(login: $username) {
      avatarUrl(size: 400)
      bio
      login
      name
      repositories(first: 20) {
        edges {
          node {
            id
            description
            forkCount
            name
            url
            updatedAt
            stargazerCount
            languages(first: 1) {
              nodes {
                color
                name
              }
            }
          }
        }
      }
    }
  }`;

const getGithubRepos = async (username) => {
  // initialize result here. why? github API returns errors as 200 OK with error object
  // so initialize here so result becomes awailable to catch
  let result = "";

  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `token ${ghToken}`
    },
    body: JSON.stringify({query, variables: {"username": username}})
  }

  try {
    isLoadingText.style.display = "flex";
    const response = await fetch(url, options);
    result = await response.json();
    isLoadingText.style.display = "none";
    isLoadedText.style.display = "block";
    insertIntoDom(result.data);
  } catch (error) {
    isLoadingText.style.display = "flex";
    isLoadingText.innerHTML = `<p>
                                ${result.errors[0].message} 
                                  <span style="color:#7b7b7b;">
                                    You will be redireacted back automtically shortly...
                                  </span>
                                </p>`;
    isLoadedText.style.display = "none";
    goBack(5000)
  }
}

const insertIntoDom = (value) => {
  let childTemplate = '';
  const repoArray = value.user.repositories.edges;
  
  usernameElement.innerHTML = value.user.name;
  loginNameElement.innerHTML = value.user.login;
  bioDescElement.innerHTML = value.user.bio;
  avatarImgElement.src = value.user.avatarUrl;
  profileImgElement.src = value.user.avatarUrl;

  for (const eachRepo of repoArray) {
    // quick fix for non-programming language repositories which does not contain node values for color and name
    // set node and default color values and name to avoid breaking
    if(eachRepo.node.languages.nodes.length == 0) {
      const nodes = [
        {
          color: "#333",
          name: "Unknown"
        }
      ];
      eachRepo.node.languages.nodes = nodes;
    }
    childTemplate +=`<div class="repo-list-items">
                              <div class="text-container">
                                <div class="title">
                                  <h2 class="is-a-blue"><a href="#">${eachRepo.node.name}</a></h2>
                                </div>
                                <div class="col is-right">
                                  <a href="#">
                                    <button class="small-btn">
                                    <i class="far fa-star"></i>
                                      Star
                                    </button>
                                  </a>
                                </div>
                              </div>
                              <p class="is-grey-text is-size-p-normal">${eachRepo.node.description}</p>
                              <p class="has-top-margin is-grey-text">
                                <span class="has-5px-margin">
                                  <i class="fas fa-circle" style="color:${eachRepo.node.languages.nodes[0].color};"></i> 
                                  ${eachRepo.node.languages.nodes[0].name}
                                </span>
                                <span class="has-5px-margin"><i class="far fa-star"></i> ${eachRepo.node.stargazerCount}</span>
                                <span class="has-5px-margin"><i class="fas fa-code-branch"></i> ${eachRepo.node.forkCount}</span>
                                <span class="has-5px-margin">
                                  Updated on ${formatDate(eachRepo.node.updatedAt)}
                                </span>
                              </p>
                            </div>
                          `;
    }

  repositoryContainer.innerHTML = childTemplate;
}

const getSearchInput = () => {
  const username = searchInputBox.value.replace(/\s+/g, '');
  if (username === "") {
    alert("You must enter a username")
    return false;
  } else {
    submitButton.innerHTML = "Loading...";
    const searchString = `?username=${username}`
    window.location.href = `profile.html${searchString}`;
  }
}


const checkUsernameAndLoad = () => {
  const theUrlParamValue = new URLSearchParams(window.location.search).get('username');
  if (theUrlParamValue === null) {
    alert("Please go back to home page and enter a username");
    window.location.href = "index.html";
  } else {
    getGithubRepos(theUrlParamValue);
  }
}


const goBack = (inSeconds) => {
  setTimeout(() => {
    window.location.href = "index.html"
  }, inSeconds);
}


const formatDate = (date) => {
  return new Date(date).toLocaleString(
    'en-us',{ day:'numeric', month:'short', year:'numeric'}
    );
}
    