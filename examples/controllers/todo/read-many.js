const { error } = require('../../../functions');
const { Todo } = require('../../models');

module.exports = async (req, res) => {
  const { me } = req.user;
  if (!me) {
    throw error(404, 'Missing required params');
  }

  const filter = { 'identity._id': me };
  const { only } = req.query;
  if (only === 'completed') {
    filter.done = true;
  }
  if (only === 'pending') {
    filter.done = false;
  }

  const todos = await Todo.find(filter).paginate(req.query);
  if (!todos) {
    throw error(404, 'Resource not found');
  }

  // add current index for every document
  todos.pages.forEach((document, i) => {
    const { page, perPage } = todos.pageParams;
    document.no = (page - 1) * perPage + i + 1;
  });

  return res.status(200).json(todos);
};
