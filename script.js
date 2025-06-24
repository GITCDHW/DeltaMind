var editPostId;

document.getElementById('sign_in_ui').style.display = 'none';

const blogContainer = document.getElementById("blog-container")

var ui = new firebaseui.auth.AuthUI(auth);

var uiConfig = {
  signInSuccessUrl:"/studio.html",
  callbacks: {
    signInSuccessWithAuthResult: function(authResult, redirectUrl) {
      console.log('User signed in:', authResult.user);
      return true;
    },
    uiShown: function() {
      console.log('FirebaseUI widget shown.');
    }
  },
  signInFlow: 'popup',
  signInOptions: [{
    provider: firebase.auth.EmailAuthProvider.PROVIDER_ID,
    signInMethod: firebase.auth.EmailAuthProvider.EMAIL_LINK_SIGN_IN_METHOD,
    emailLinkSignIn: {
      url: "/studio.html",
      handleCodeInApp: true
    }
  }],
  tosUrl: '/terms.html',
  privacyPolicyUrl: '/privacy.html'
};

ui.start('#sign_in_ui', uiConfig);

auth.onAuthStateChanged((user) => {
  
  document.getElementById("container").style.display = "flex";
    document.getElementById("loading").style.display = "none";
    
  if (user) {
    if (blogContainer) {
      blogContainer.innerHTML = ""
      displayUserPosts(user.uid)
    }
    
    const currentUserRef = userProfilesRef.child(user.uid)
    currentUserRef.once("value").then(snapshot=>{
      if (!snapshot.exists()) {
        currentUserRef.set({
          "Uid":user.uid,
          "DisplayName":"Anonymous User",
          "Email":user.email,
          "Bio":"I Love Science & DeltaMind"
        }).then(()=>{
          alert("Profile Created Successfully")
           document.getElementById('sign_in_ui').style.display = 'none';
        }).catch(error=>{
          alert(error)
        })
      }
    })
    
  } else {
    document.getElementById("container").style.display = "none";
    document.getElementById("loading").style.display = "none";
    console.log('No user is signed in.');
    document.getElementById('sign_in_ui').style.display = 'block';
  }
});

function signOutUser() {
  auth.signOut().then(() => {
    console.log('User signed out.');
  }).catch((error) => {
    console.error('Error signing out:', error);
  });
}

function savePost(title, content) {
  auth.onAuthStateChanged(user => {
    if (user) {
      if (editPostId) {
        const blogPostRef = rtdb.ref(`blogs/${editPostId}`)
        blogPostRef.update({
          "Title":title,
          "Content":content
        }).then(()=>{
          alert("changes saved successfully ")
          editPostId=null;
          window.location.reload()
        }).catch(error=>{
          alert(error)
        })
      } else {
        const newBlogRef = blogRef.push();
        newBlogRef.set({
          "Title": title,
          "Content": content,
          "Author": user.uid,
          "Timestamp": firebase.database.ServerValue.TIMESTAMP
        }).then(() => {
          document.getElementById("blog_writing_section").style.display = "none";
          document.getElementById('container').style.display = 'flex';
          window.location.reload();
        }).catch(error => {
          console.log(error)
        });
      }
    } else {
      alert("please sign in to create new post")
    }
  })
}

function displayUserPosts(uid) {
  blogRef.orderByChild('Author').equalTo(uid).once('value').then((snapshot) => {
    if (snapshot.exists()) {
      
      const posts = snapshot.val()
      
      Object.keys(posts).forEach((blogId) => {
        
        const post = posts[blogId]
        const timestamp = new Date(post.Timestamp).toLocaleString();
        
        const blogCard = document.createElement("div")
        
        blogCard.className = "blog-card"
        
        blogCard.innerHTML = `<h2 class="blog-title">${post.Title}</h2>
                <p class="blog-date">${timestamp}</p>
                <div class="card-actions">
                    <i class="fas fa-redo-alt editPost" data-blogid_edit=${blogId}></i>
                    <i data-blogid=${blogId} class="fas fa-trash-alt deletePost"></i>
                </div>`
        if (blogContainer) {
          blogContainer.appendChild(blogCard)
        }
      })
      
      document.querySelectorAll(".editPost").forEach((editButton) => {
        editButton.addEventListener("click", editPost_show)
      })
      
      document.querySelectorAll(".deletePost").forEach((deleteButton) => {
        deleteButton.addEventListener("click", deletePost)
      })
      
    }
  }).catch((error) => {
    console.log(error)
  })
}

function deletePost(event) {
  const blogId = event.target.dataset.blogid;
  blogPostRef = rtdb.ref(`blogs/${blogId}`)
  if (confirm("are you sure want to delete this post?")) {
    blogPostRef.remove().then(() => {
      window.location.reload();
    }).catch(error => {
      console.log(error)
    })
  }
}

function editPost_show(event) {
  
  const blogId = event.target.dataset.blogid_edit;
  
  editPostId = blogId
  
  const blogPostRef = rtdb.ref(`blogs/${blogId}`)
  
  blogPostRef.once('value').then(snapshot => {
    if (snapshot.exists()) {
      const postData = snapshot.val()
      document.getElementById("blog_writing_section").style.display = "flex";
      document.getElementById("titleInput").value = postData.Title;
      document.getElementById("contentInput").value = postData.Content;
      document.getElementById("container").style.display = "none"
    }
  })
  
}

function showUserCard(){
  
  auth.onAuthStateChanged(user=>{
    if (user) {
      const userProfileRef=rtdb.ref(`users/${user.uid}`);
      
      document.getElementById("userCard").style.display="flex";
      const userName=document.querySelector(".profile-name")
      const userBio = document.querySelector(".profile-tagline")
      const userId = document.querySelector(".profile-id")
      userProfileRef.once("value").then(userDetails=>{
        
        const userData = userDetails.val()
        userName.innerHTML=userData.DisplayName;
        userBio.innerHTML=userData.Bio
        userId.innerHTML=userData.Uid
      })
    }
  })
}

function initEditMode() {
  
  document.querySelector(".edit-button").style.display="none"
  document.querySelector(".save-button").style.display="flex"
  
  document.querySelector(".profile-name").contentEditable=true
  document.querySelector(".profile-tagline").contentEditable=true
  document.querySelector(".profile-name").style.border="1px solid #fff"
  document.querySelector(".profile-tagline").style.border="1px solid #fff"
  document.querySelector(".save-button").style.right="30px"
}

function saveUserProfile() {
  
  document.querySelector(".edit-button").style.display="flex"
  document.querySelector(".save-button").style.display="none"
  
  const username = document.querySelector(".profile-name").innerHTML
  const bio = document.querySelector(".profile-tagline").innerHTML
  
  const uid = auth.currentUser.uid
  const userProfileRef = rtdb.ref(`users/${uid}`)
  
  if (!username) {
    alert("username can't be empty!")
    return
  }
  
  userProfileRef.update({
    "DisplayName":username,
    "Bio":bio
  }).then(()=>{
    alert("your profile is successfully updated!")
    closeEditMode()
  }).catch(error=>{
    alert(error)
  })
}
function closeCard() {
  document.getElementById("userCard").style.display="none";
}

function closeEditMode(){
  document.querySelector(".save-button").style.display="none"
  document.querySelector(".profile-name").contentEditable=false
  document.querySelector(".profile-tagline").contentEditable=false
  document.querySelector(".profile-name").style.border="none"
  document.querySelector(".profile-tagline").style.border="none"
  closeCard()
}

document.querySelector(".close-button").addEventListener("click",closeEditMode)
document.querySelector(".user-profile-button").addEventListener("click",showUserCard)

document.getElementById("signOut").addEventListener("click", () => {
  signOutUser()
})

document.getElementById("create").addEventListener("click", () => {
  document.getElementById("blog_writing_section").style.display = "flex";
  document.getElementById('container').style.display = 'none';
})

document.getElementById("close_blog_writer").addEventListener("click", () => {
  document.getElementById("blog_writing_section").style.display = "none";
  document.getElementById('container').style.display = 'flex';
})

const content = document.getElementById("contentInput")
const title = document.getElementById("titleInput")

document.getElementById("post_btn").addEventListener("click", () => {
  savePost(title.value, content.value)
})

document.querySelector(".edit-button").addEventListener("click",initEditMode)

document.querySelector(".save-button").addEventListener("click",saveUserProfile)
  
  