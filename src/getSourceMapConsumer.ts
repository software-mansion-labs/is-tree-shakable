import { SourceMapConsumer } from "source-map";

type GetSourceMapConsumer = {
  (): Promise<SourceMapConsumer>;
  (path: string): Promise<SourceMapConsumer | null>;
};

export default GetSourceMapConsumer;
