const express = require('express');
const bodyParser = require('body-parser');
const { randomBytes } = require('crypto');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(bodyParser.json());
app.use(cors());

const commentsByPostId = {

};

app.get('/posts/:id/comments', ({ params }, res) => {
  const { id } = params;

  res.send(commentsByPostId[id] || []);
});

app.post('/posts/:id/comments', async ({ body, params}, res) => {
  const commentId = randomBytes(4).toString('hex');

  const { id } = params;
  const { content } = body;

  const comments = commentsByPostId[id] || [];
  comments.push({ id: commentId, status: 'pending', content });

  commentsByPostId[id] = comments;

  await axios.post('http://event-bus-srv:4005/events', {
    type: 'CommentCreated',
    data: {
      id: commentId,
      content,
      postId: id,
      status: 'pending',
    }
  })

  res.status(200).send(comments);
});

app.post('/events', async (req, res) => {
  console.log('Received Event', req.body.type);

  const { type, data } = req.body;

  if (type === 'CommentModerated') {
    const { id, postId, status, content } = data;
    const comments = commentsByPostId[postId];

    const comment = comments.find(comment => {
      return comment.id === id
    });

    comment.status = status;

    await axios.post('http://event-bus-srv:4005/events', {
      type: 'CommentUpdated',
      data: {
        id,
        status,
        postId,
        content,
      }
    })
  }

  res.send({});
});

app.listen(4001, () => {
  console.log('Listening on 4001');
})
