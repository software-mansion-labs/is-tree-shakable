import { Comment, Node } from "acorn";
import Context from "./context";

const DIRECTIVE = "is-tree-shakable-suppress";
const WHITESPACE_REGEX = /^[\s;]*$/;

const isCodeBlank = (start: number, end: number, context: Context) => WHITESPACE_REGEX.test(context.code.slice(start, end));

const precedes = (comment: Comment, node: Node, context: Context) =>
  comment.end <= node.start && isCodeBlank(comment.end, node.start, context);

const hasSuppression = (node: Node, context: Context, nextSibling?: Node) => {
  const nextStatement = context.body[context.nodeIndex + 1];
  if (node === context.body[context.nodeIndex] && nextStatement?.type === "ClassDeclaration") nextSibling = nextStatement;
  const result = context.comments.some((comment) => {
    if (!comment.value.includes(DIRECTIVE)) return false;
    if (precedes(comment, node, context)) return true;
    // Between siblings, a directive belongs to the following construct.
    if (nextSibling && precedes(comment, nextSibling, context)) return false;
    return comment.start >= node.end && isCodeBlank(node.end, comment.start, context);
  });
  if (result) context.reportSuppression();
  return result;
};

export default hasSuppression;
