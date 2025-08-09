<!--
 * @Author: shawicx d35f3153@proton.me
 * @Date: 2024-06-23 12:13:31
 * @LastEditors: shawicx d35f3153@proton.me
 * @LastEditTime: 2025-08-09 09:46:08
 * @Description: 
-->
```typescript
import axios from 'axios';

const PROJECT_CONFIHG = {
  project_id: 746,
  token: "f9d8fc1b2e8a8dac9b880e7ae4b73297f13fda67abef76931abf0db982116cde",
}

const COPY_PROJECT_CONFIHG = {
  project_id: 1380,
  token: "4092a629af039262cea2b11e47c1fbe5d34b5934ce1bb2a01ec43f4c623ac2cb",
}

const YAPI_CONFIG = {
  url: 'http://yapi.uniubi.com',
  catPath: '/api/interface/list_menu',
};

// 需要遍历的分类ID
const ids = [
  8379, 8684, 8359, 8679, 8614, 8429, 8619, 8639, 8934, 8689, 8629, 8694, 8674,
  8909, 7926, 8649, 8944, 7932, 8954, 8634, 8919, 10564, 10729, 10709, 8754,
  8929, 7934, 13352, 13388, 7927, 7929, 14855, 15125, 7918, 16133, 23216, 7909,
  8364, 7361, 8444, 8704, 8374, 29641,
];

/**
 * 获取分类列表
 */
export const fetchCats = async () => {
  const result: number[] = [];
  // 在复制出来的yapi项目中 未被找到的分类
  const notFound: number[] = [];
  try {
    console.log('请求数据中...')
    const resSource = await axios.get(`${YAPI_CONFIG.url}${YAPI_CONFIG.catPath}`, {
      params: {
        ...PROJECT_CONFIHG,
      }
    });
    // 复制的yapi 项目
    const resCopy = await axios.get(`${YAPI_CONFIG.url}${YAPI_CONFIG.catPath}`, {
      params: {
        ...COPY_PROJECT_CONFIHG,
      }
    });
    console.log('数据请求完成,正在处理...')
    const source: any[] = resSource?.data?.data?.length ? resSource?.data?.data : [];
    const copySource: any[] = resCopy?.data?.data?.length ? resCopy?.data?.data : [];
    // 未找到分类 直接返回空
    if (!source.length || !copySource.length) {
      return;
    }
    source.forEach((element: any) => {
      const { name } = element;
      if (ids.includes(element['_id'])) {
        const item: any = copySource.find((c) => c.name === name);
        if (item) {
          result.push(item['_id'] as number);
        } else {
          notFound.push(element['_id']);
          // console.log(element, '未被找到的分类');
        }
      }
    });
    console.log(result, notFound, '遍历结果')
    // console.log('数据处理完成,读取文件...')
    // const fileStr = fs.readFileSync(path.join(__dirname, './config.ts'))
    // 	.toString('utf8')
    // fs.writeFileSync(path.join(__dirname, './config.ts'), fileStr)
  } catch (e) {
    console.log(e);
    return result
  }
};
```