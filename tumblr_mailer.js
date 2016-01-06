var fs = require('fs');
var ejs = require('ejs');
var tumblr = require('tumblr.js')

function csvParse(string) {
    var array = string.split('\n');
    for (var i = 0; i < array.length; i++) {
        array[i] = array[i].split(',');
    };
    
    var arrayOfObj = [];
    for (var i = 1; i < array.length; i++) {
        var obj = {};
        for (var j = 0; j < array[0].length; j++) {
            obj[array[0][j]] = array[i][j];
        };
        arrayOfObj.push(obj);
    };
    // return as an object with persons:[arrayOfObj]
    personObj = {}
    personObj['persons'] = arrayOfObj;
    return personObj;
}

function replaceName(personData) {
    //pull in html from email template and convert to string
    var template = fs.readFileSync('email_template.html', 'utf8');
    //loop over recipients and replace the variables with person's info
    var variables = ['FIRST_NAME', 'NUM_MONTHS_SINCE_CONTACT'];

    for (var i = 0; i < personData.length; i++) {
        var personalEmail = template
        personalEmail = personalEmail.replace(variables[0],personData[i]['firstName']);
        personalEmail = personalEmail.replace(variables[1],personData[i]['numMonthsSinceContact']);
        //console.log(personalEmail);
    };
}

function ejsReplace(data) {
    var template = fs.readFileSync('email_template.ejs', 'utf8');
    data['persons'].forEach(function(person) {
        var objToSend = {};
        objToSend['persons']=person;
        objToSend['latestPosts'] = data.latestPosts;
        var newTemplate = ejs.render(template, objToSend);
        console.log(newTemplate);
    });
}


//sets up the tumblr API with the auth keys, assigns to client
var client = tumblr.createClient({
  consumer_key: 'ULSykFOAVU0UcKQ0FEnGvH6qYD073Yh3wKkOto4g2gN1vkhaqE',
  consumer_secret: 'jB8kJ0bZewAfQWLZypmiwsmKtZIzXrY1dnbCeajopxb0IYwb7z',
  token: 'et2jQPb0o28kmTB7eS0eQkpgAfm541pVctK9NHPxJbmySk70WQ',
  token_secret: 'ggkJoeRzWpPxuHfd96NwpFCginoSWIjAveewi2cHhOt5anKxIN'
});

//accesses the post key on the blogs object from the tumblr client
var posts;
var templates;

function getTumblrPosts() {
    client.posts('codyscodes.tumblr.com', function (err, blog) {
        if(blog.total_posts>0) {
            posts = blog.posts;
            //calling rest of functions within callback
            ejsReplace(combineDataForTemplate(csvData, posts));
        }    
    });
}


//add the tubmblr posts to the object being passed the the ejs template - name it latestPosts
function combineDataForTemplate (people, posts) {
    //pull out each post and check to see if it was published within 7 days
    people['latestPosts'] = [];
    for (var i =0; i<posts.length;i++) {
        //add a new item to posts that is the days old - then can look to it for how old
        var postDate = new Date(posts[i].date);
        var nowDate = new Date();
        posts[i]['days_old'] = Math.ceil((nowDate.getTime()-postDate.getTime())/(1000*3600*40));
        if (posts[i]['days_old'] <= 7) {
            people['latestPosts'].push(posts[i]);
        }
    }
    return people;
}


var csvFile = fs.readFileSync('friend_list.csv', 'utf8');
var csvData = csvParse(csvFile);
getTumblrPosts()

//var dataForEmails = combineDataForTemplate(csvData, posts)
//replaceName(csvData);

//ejsReplace(dataForEmails);



