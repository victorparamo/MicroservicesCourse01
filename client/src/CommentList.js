import React from 'react'

export const CommentList = ({ comments }) => {
  return (
    <ul>
      {comments.map((comment) => {
        let content;

        switch(comment.status) {
          case 'pending':
            content = 'This comment is awaiting moderation.'
            break;
          case 'rejected':
            content = 'This comment has been rejected.'
            break;
          default:
            content = comment.content;
        }

        return (
          <li key={comment.id}>
            {content}
          </li>
        )
        }
      )}
    </ul>
  )
}
