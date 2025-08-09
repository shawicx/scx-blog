<!--
 * @Author: shawicx d35f3153@proton.me
 * @Date: 2024-06-23 11:50:07
 * @LastEditors: shawicx d35f3153@proton.me
 * @LastEditTime: 2025-08-09 09:44:35
 * @Description: 
-->
# 地图坐标系

### 坐标系

1. 地球坐标系——WGS84：常见于 GPS 设备，Google 地图等国际标准的坐标体系。
2. 火星坐标系——GCJ-02：中国国内使用的被强制加密后的坐标体系，高德坐标就属于该种坐标体系。
3. 百度坐标系——BD-09：百度地图所使用的坐标体系，是在火星坐标系的基础上又进行了一次加密处理。

### 坐标系转换

```typescript
// 其他转高德
const gps = [116.3, 39.9];
AMap.convertFrom(gps, 'gps', function (status, result) {
  if (result.info === 'ok') {
    var lnglats = result.locations; // Array.<LngLat>
  }
});
```

### 高德地图使用

```html
// index.html
<!doctype html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport"
          content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <script type="text/javascript">
      // window._AMapSecurityConfig = {
      //   serviceHost:'您的代理服务器域名或地址/_AMapService',
      //   // 例如 ：serviceHost:'http://1.1.1.1:80/_AMapService',
      // }
      window._AMapSecurityConfig = {
        securityJsCode: '5a140667dc5bbe20e03cae7f1cf60fd6',
      };
    </script>
    <script type="text/javascript" src="https://webapi.amap.com/maps?v=1.4.15&key=94483fe7a13c234bc844ceb20c7a1915"></script>
    <script type="text/javascript" src="https://webapi.amap.com/maps?v=1.4.15&key=94483fe7a13c234bc844ceb20c7a1915&plugin=AMap.MouseTool,AMap.Scale,AMap.OverView,AMap.Geolocation,AMap.AdvancedInfoWindow,AMap.Autocomplete,AMap.PlaceSearch,AMap.PlaceSearch,AMap.Geocoder,AMap.Marker"></script>
    <title>Document</title>
</head>
<body>
    <div id="root"></div>
</body>
</html>
```

```tsx
// AMap.ts
import { Input } from 'antd';
import { ChangeEvent, FC, useEffect, useRef, useState } from 'react';

import styles from './amap.less';

interface IAMapProps {
  // 中心点 [经度, 纬度]
  center: number[];
  // zoom
  zoom: number;
  width: string;
  height: string;
  autoOptions?: object;
  markCenter?: boolean;
}

const defaultAutoOptions = {
  // 城市，默认全国
  city: '全国',
  // 使用联想输入的input的id
  input: 'gd-map-autoComplete',
};

// @ts-ignore
const { AMap } = window;

const Map: FC<IAMapProps> = props => {
  const { center, zoom, width, height, autoOptions, markCenter = true } = props;
  const mapInstance = useRef<any>(null);

  const [inputValue, setInputValue] = useState('');

  const renderMap = () => {
    // 实例化地图
    if (mapInstance.current) mapInstance.current.destroy();
    const map = new AMap.Map('gd-map', {
      zoom,
      center,
    });
    const clickHandler = function(e: any) {
      map.clearMap();
      const point = [e.lnglat.getLng(), e.lnglat.getLat()];
      const marker = new AMap.Marker({
        position: point,
      });
      map.add(marker);
      // map.setZoomAndCenter(zoom, point);
    };
    // 绑定事件
    map.on('click', clickHandler);

    AMap.plugin(['AMap.Autocomplete', 'AMap.PlaceSearch'], () => {
      const autocomplete = new AMap.Autocomplete(
        autoOptions
          ? Object.assign(defaultAutoOptions, autoOptions)
          : defaultAutoOptions,
      );
      AMap.event.addListener(autocomplete, 'select', (e: any) => {
        const {
          poi: { name, location },
        } = e;
        const { lat, lng } = location;
        const point = [lng, lat];
        setInputValue(name);
        const marker = new AMap.Marker({
          position: point,
        });
        map.setCenter(point);
        map.add(marker);
      });
    });

    mapInstance.current = map;
  };

  // 输入框内容
  const handleInput = (event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setInputValue(value);
  };

  useEffect(() => {
    renderMap();
  }, []);

  useEffect(() => {
    if (mapInstance.current) {
      if (!markCenter) {
        mapInstance.current.setZoomAndCenter(zoom, center);
        return;
      }
      const marker = new AMap.Marker({
        position: center,
      });
      mapInstance.current.setZoomAndCenter(zoom, center);
      mapInstance.current.add(marker);
    }
  }, [center, zoom]);

  return (
    <div className={styles.amap}>
      <div className={styles['amap-input-wrapper']}>
        <Input
          id="gd-map-autoComplete"
          value={inputValue}
          onChange={handleInput}
          allowClear
          className={styles['amap-input']}
          placeholder="请输入"
        />
      </div>
      <div
        id="gd-map"
        style={{ width: width || '100%', height: height || '100%' }}
      />
    </div>
  );
};

export default Map;
```

```less
// amap.less`
.amap {
  position: relative;

  &-input-wrapper {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 30;

    .amap-input {
      width: 200px;
      height: 32px;
    }
  }
}
```
