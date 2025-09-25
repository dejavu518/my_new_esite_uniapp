import devConfig from "./dev.js";
import prodConfig from "./prod.js";

// 根据环境导出配置
export default process.env.NODE_ENV === "production" ? prodConfig : devConfig;
