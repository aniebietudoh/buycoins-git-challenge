const url = 'https://api.github.com/graphql';

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
      Authorization: `token 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`
    },
    body: JSON.stringify({query, variables: {"username": username}})
  }

  try {
    document.getElementById("isLoading").style.display = "flex";
    const response = await fetch(url, options);
    result = await response.json();
    document.getElementById("isLoading").style.display = "none";
    document.getElementById("isLoaded").style.display = "block";
    insertIntoDom(result.data);
  } catch (error) {
    document.getElementById("isLoading").style.display = "flex";
    document.getElementById("isLoading").innerHTML = `<p>
                                                        ${result.errors[0].message} 
                                                        <span style="color:#7b7b7b;">
                                                          You will be redireacted back automtically shortly...
                                                        </span>
                                                      </p>`;
    document.getElementById("isLoaded").style.display = "none";
    goBack(5000)
  }
}

const insertIntoDom = (value) => {
  let childTemplate = '';
  let repoContainer = document.getElementById("repositories");
  const repoArray = value.user.repositories.edges;
  
  document.getElementById("user_name").innerHTML = value.user.name;
  document.getElementById("login_name").innerHTML = value.user.login;
  document.getElementById("bio_description").innerHTML = value.user.bio;
  document.getElementById("avatar-image").src = value.user.avatarUrl;
  document.getElementById("profile-image").src = value.user.avatarUrl;

  for (const eachRepo of repoArray) {
    // quick fix for empty repositories which does not contain node values for color and name
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

  repoContainer.innerHTML = childTemplate;
}

const getSearchInput = () => {
  const searchInputBox = document.getElementById("usernameInput")
  const username = searchInputBox.value;
  if (username === "") {
    alert("You must enter a username")
    return false;
  } else {
    document.getElementById("searchButton").innerHTML = "Loading...";
    const searchString = `?username=${username}`
    window.location.href = `profile.html${searchString}`;
  }
}

const checkUsernameAndLoad = () => {
  const theUrlParamValue = new URLSearchParams(window.location.search).get('username');
  if (theUrlParamValue === null) {
    console.log(theUrlParamValue)
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
  return new Date(date).toLocaleString('en-us',{ day:'numeric', month:'short', year:'numeric'});
}
    