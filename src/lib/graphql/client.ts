import { HoudiniClient } from "$houdini";

export default new HoudiniClient({
  fetchParams() {
    return {
      credentials: "include",
    };
  },
});
