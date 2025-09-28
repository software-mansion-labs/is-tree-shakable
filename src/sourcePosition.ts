import { Position } from "acorn";

type SourcePosition = {
  path: string;
  start: Position;
  end: Position;
};

export default SourcePosition;
