import { Comment, Node } from "acorn";
import Context from "./context";

const DIRECTIVE = "is-tree-shakable-suppress";
const WHITESPACE_REGEX = /^[\s;]*$/;

const isCodeBlank = (start: number, end: number, context: Context) => start >= end || WHITESPACE_REGEX.test(context.code.slice(start, end));

const appliesToNode = (comment: Comment, node: Node, context: Context) =>
  comment.value.includes(DIRECTIVE) &&
  ((comment.end <= node.start && isCodeBlank(comment.end, node.start, context)) ||
    (comment.start >= node.end && isCodeBlank(node.end, comment.start, context)));

const hasSuppression = (node: Node, context: Context) => {
  const result = context.comments.some((comment) => appliesToNode(comment, node, context));
  if (result) context.reportSuppression();
  return result;
};

export default hasSuppression;
