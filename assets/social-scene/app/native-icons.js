
'use strict';
// Paths observed in public X / Instagram UI on 2026-10-25; sources in REFERENCES.md.
const SCENE_NATIVE_ICONS = {
  x: {
    x:{path:'m21.62 21.5-7.47-10.9 6.97-8.1H18.7l-5.62 6.54L8.6 2.5H2.48L9.68 13l-7.3 8.5H4.8l5.96-6.93 4.76 6.93zM7.8 4.03l10.93 15.94H16.3L5.38 4.03z'},
    back:{path:'M7.414 13l5.043 5.04-1.414 1.42L3.586 12l7.457-7.46 1.414 1.42L7.414 11H21v2H7.414z'},
    search:{path:'M10.25 3.75c-3.59 0-6.5 2.91-6.5 6.5s2.91 6.5 6.5 6.5c1.795 0 3.419-.726 4.596-1.904 1.178-1.177 1.904-2.801 1.904-4.596 0-3.59-2.91-6.5-6.5-6.5zm-8.5 6.5c0-4.694 3.806-8.5 8.5-8.5s8.5 3.806 8.5 8.5c0 1.986-.682 3.815-1.824 5.262l4.781 4.781-1.414 1.414-4.781-4.781c-1.447 1.142-3.276 1.824-5.262 1.824-4.694 0-8.5-3.806-8.5-8.5z'},
    more:{path:'M3 12c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2zm9 2c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm7 0c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z'},
    chat:{path:'M1.751 10c0-4.42 3.584-8 8.005-8h4.366c4.49 0 8.129 3.64 8.129 8.13 0 2.96-1.607 5.68-4.196 7.11l-8.054 4.46v-3.69h-.067c-4.49.1-8.183-3.51-8.183-8.01zm8.005-6c-3.317 0-6.005 2.69-6.005 6 0 3.37 2.77 6.08 6.138 6.01l.351-.01h1.761v2.3l5.087-2.81c1.951-1.08 3.163-3.13 3.163-5.36 0-3.39-2.744-6.13-6.129-6.13H9.756z'},
    repost:{path:'M4.5 3.88l4.432 4.14-1.364 1.46L5.5 7.55V16c0 1.1.896 2 2 2H13v2H7.5c-2.209 0-4-1.79-4-4V7.55L1.432 9.48.068 8.02 4.5 3.88zM16.5 6H11V4h5.5c2.209 0 4 1.79 4 4v8.45l2.068-1.93 1.364 1.46-4.432 4.14-4.432-4.14 1.364-1.46 2.068 1.93V8c0-1.1-.896-2-2-2z'},
    heart:{path:'M16.697 5.5c-1.222-.06-2.679.51-3.89 2.16l-.805 1.09-.806-1.09C9.984 6.01 8.526 5.44 7.304 5.5c-1.243.07-2.349.78-2.91 1.91-.552 1.12-.633 2.78.479 4.82 1.074 1.97 3.257 4.27 7.129 6.61 3.87-2.34 6.052-4.64 7.126-6.61 1.111-2.04 1.03-3.7.477-4.82-.561-1.13-1.666-1.84-2.908-1.91zm4.187 7.69c-1.351 2.48-4.001 5.12-8.379 7.67l-.503.3-.504-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.41-4.86-.514-6.67.887-1.79 2.647-2.91 4.601-3.01 1.651-.09 3.368.56 4.798 2.01 1.429-1.45 3.146-2.1 4.796-2.01 1.954.1 3.714 1.22 4.601 3.01.896 1.81.846 4.17-.514 6.67z'},
    heartFill:{path:'M20.884 13.19c-1.351 2.48-4.001 5.12-8.379 7.67l-.503.3-.504-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.41-4.86-.514-6.67.887-1.79 2.647-2.91 4.601-3.01 1.651-.09 3.368.56 4.798 2.01 1.429-1.45 3.146-2.1 4.796-2.01 1.954.1 3.714 1.22 4.601 3.01.896 1.81.846 4.17-.514 6.67z'},
    stats:{path:'M8.75 21V3h2v18h-2zM18 21V8.5h2V21h-2zM4 21l.004-10h2L6 21H4zm9.248 0v-7h2v7h-2z'},
    bookmark:{path:'M4 4.5C4 3.12 5.119 2 6.5 2h11C18.881 2 20 3.12 20 4.5v18.44l-8-5.71-8 5.71V4.5zM6.5 4c-.276 0-.5.22-.5.5v14.56l6-4.29 6 4.29V4.5c0-.28-.224-.5-.5-.5h-11z'},
    bookmarkFill:{path:'M4 4.5C4 3.12 5.119 2 6.5 2h11C18.881 2 20 3.12 20 4.5v18.44l-8-5.71-8 5.71V4.5z'},
    share:{path:'M12 2.59l5.7 5.7-1.41 1.42L13 6.41V16h-2V6.41l-3.3 3.3-1.41-1.42L12 2.59zM21 15l-.02 3.51c0 1.38-1.12 2.49-2.5 2.49H5.5C4.11 21 3 19.88 3 18.5V15h2v3.5c0 .28.22.5.5.5h12.98c.28 0 .5-.22.5-.5L19 15h2z'},
    verified:{path:'M12 1.75c1.4 0 2.62.87 3.34 2.19 1.44-.43 2.92-.17 3.91.81s1.24 2.47.81 3.91c1.32.72 2.2 1.94 2.2 3.34s-.88 2.62-2.2 3.34c.43 1.44.18 2.92-.81 3.9-.99 1-2.47 1.25-3.91.82-.72 1.32-1.94 2.19-3.34 2.19s-2.62-.87-3.34-2.2c-1.44.44-2.92.18-3.9-.8-1-.99-1.24-2.47-.82-3.91-1.32-.72-2.19-1.95-2.19-3.34 0-1.4.87-2.62 2.2-3.34-.43-1.44-.18-2.92.8-3.9.99-1 2.47-1.25 3.91-.82.72-1.32 1.95-2.19 3.34-2.19M10.45 13.3l-2.23-2.25-1.42 1.4 3.7 3.75 6.24-6.77-1.47-1.36z'}
  },
  instagram:{
    verified:{size:40,path:'M19.998 3.094 14.638 0l-2.972 5.15H5.432v6.354L0 14.64 3.094 20 0 25.359l5.432 3.137v5.905h5.975L14.638 40l5.36-3.094L25.358 40l3.232-5.6h6.162v-6.01L40 25.359 36.905 20 40 14.641l-5.248-3.03v-6.46h-6.419L25.358 0l-5.36 3.094Zm7.415 11.225 2.254 2.287-11.43 11.5-6.835-6.93 2.244-2.258 4.587 4.581 9.18-9.18Z'},
    heartFill:{path:'M20.972 4.468a5.5 5.5 0 0 0-7.778 0L12 5.662l-1.194-1.194a5.5 5.5 0 0 0-7.778 7.778l8.265 8.265a1 1 0 0 0 1.414 0l8.265-8.265a5.5 5.5 0 0 0 0-7.778Z'},
    bookmarkFill:{path:'M4.5 2h15v21L12 17.5 4.5 23Z'},
    reels:{path:'M22.935 7.468c-.063-1.36-.307-2.142-.512-2.67a5.341 5.341 0 0 0-1.27-1.95 5.345 5.345 0 0 0-1.95-1.27c-.53-.206-1.311-.45-2.672-.513C15.333 1.012 14.976 1 12 1s-3.333.012-4.532.065c-1.36.063-2.142.307-2.67.512-.77.298-1.371.69-1.95 1.27a5.36 5.36 0 0 0-1.27 1.95c-.206.53-.45 1.311-.513 2.672C1.012 8.667 1 9.024 1 12s.012 3.333.065 4.532c.063 1.36.307 2.142.512 2.67.297.77.69 1.372 1.27 1.95.58.581 1.181.974 1.95 1.27.53.206 1.311.45 2.672.513C8.667 22.988 9.024 23 12 23s3.333-.012 4.532-.065c1.36-.063 2.142-.307 2.67-.512a5.33 5.33 0 0 0 1.95-1.27 5.356 5.356 0 0 0 1.27-1.95c.206-.53.45-1.311.513-2.672.053-1.198.065-1.555.065-4.531s-.012-3.333-.065-4.532Zm-1.998 8.972c-.05 1.07-.228 1.652-.38 2.04-.197.51-.434.874-.82 1.258a3.362 3.362 0 0 1-1.258.82c-.387.151-.97.33-2.038.379-1.162.052-1.51.063-4.441.063s-3.28-.01-4.44-.063c-1.07-.05-1.652-.228-2.04-.38a3.354 3.354 0 0 1-1.258-.82 3.362 3.362 0 0 1-.82-1.258c-.151-.387-.33-.97-.379-2.038C3.011 15.28 3 14.931 3 12s.01-3.28.063-4.44c.05-1.07.228-1.652.38-2.04.197-.51.434-.875.82-1.26a3.372 3.372 0 0 1 1.258-.819c.387-.15.97-.329 2.038-.378C8.72 3.011 9.069 3 12 3s3.28.01 4.44.063c1.07.05 1.652.228 2.04.38.51.197.874.433 1.258.82.385.382.622.747.82 1.258.151.387.33.97.379 2.038C20.989 8.72 21 9.069 21 12s-.01 3.28-.063 4.44Zm-4.584-6.828-5.25-3a2.725 2.725 0 0 0-2.745.01A2.722 2.722 0 0 0 6.988 9v6c0 .992.512 1.88 1.37 2.379.432.25.906.376 1.38.376.468 0 .937-.123 1.365-.367l5.25-3c.868-.496 1.385-1.389 1.385-2.388s-.517-1.892-1.385-2.388Zm-.993 3.04-5.25 3a.74.74 0 0 1-.748-.003.74.74 0 0 1-.374-.649V9a.74.74 0 0 1 .374-.65.737.737 0 0 1 .748-.002l5.25 3c.341.196.378.521.378.652s-.037.456-.378.651Z'}
  },
  kakao:{
    smile:{stroke:'M8 9h.01M16 9h.01M7 14a5.3 5.3 0 0 0 10 0'},
    back:{stroke:'M14.5 4 6.5 12l8 8'},
    send:{stroke:'M12 20V4M5 11l7-7 7 7'},
    hash:{stroke:'M9 3 6 21M18 3l-3 18M3 9h19M2 16h19'},
    search:{stroke:'M20 20l-5.2-5.2M17 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0'},
    menu:{stroke:'M3 6h18M3 12h18M3 18h18'}
  },
  system:{
    wifi:{path:'M12 4C7.7 4 4 5.6 1 8.3l1.8 2C5.3 8 8.5 6.7 12 6.7s6.7 1.3 9.2 3.6l1.8-2C20 5.6 16.3 4 12 4ZM12 9c-2.9 0-5.5 1.1-7.5 2.9l1.9 2C7.9 12.6 9.9 12 12 12s4.1.6 5.6 1.9l1.9-2A11 11 0 0 0 12 9Zm0 5.2c-1.6 0-3 .6-4.2 1.5L12 20l4.2-4.3a6.8 6.8 0 0 0-4.2-1.5Z'},
    signal:{path:'M2 14h3v7H2zM7.5 10h3v11h-3zM13 6h3v15h-3zM18.5 2h3v19h-3z'}
  }
};
Object.assign(SCENE_NATIVE_ICONS.instagram,{"heart": {"image": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAD00lEQVR4nKVVS2scRxD+qmemZ98eWZIRRgchEFIgB7OEkOQHiCSXYPI4GHTIIRgfhA/BB/+EGEJOwSAwxodgXYIxsRIMiUmw8yCHEDCsHBwWn0JYw2olrebRM90dajwTdo2sSEpBz6On5/u+6qquIiEE5ufnMWpEhCiKIKXMn621cF0Xnuflc2maYm9vD61WCzs7O1BKwav4MK5AAgPrCqRCQtsaxBgyMAPgUyJ6HASBnpqaegrgrhDiA/7IRMaY/O44zntKqbtE9JTXWuCxFfTZiemTM6kDpEIgdiQEKyzGMhE9JCIhpTzb6XS8MAwXkyS56vv+JSnlBhE10jRtGGM2eE4pxd8WeW2SJGd93zdRGD0EsAwYEDKQ4zi8RW8A+BLAOwB+ZZXVajV33VqLiYkJN4qia1rrmSzLWP1ftVrto+3t7axer4PnYpUgZlDPeUWR/SoV8n1FjQe0tLQktdZ/AFgFcKeMARvHp3wXQkhr7c9MTkSvE5FiYF5TbpuBhSHweDtD5fPQaS26AM4BeFSCv8iMMYqIPi5IFV/Yewb+Nzks4PAAvgbhkUM4xwTvEtH1UbDyJ1ZWAhX2/UEinpN0HTArLOdVAA+eV3McsySgyUViXWRC/qTJbbMHp4Ig6HFes2LOfw7cqCebm5sHAi8sLDwDh0RGEpG2aASn/46241PswU6apkEZTD5Qx5MvcpKM3PyQxZkIHK8aMkFHKdVm9RxA3/dz5aPjqMY4SZK0fd/vMMEtpdSK1joPJntQpumRjAzIGrg2g08ZoHZX6o66Jfr9/lqz2VzOsqzNJJzbx1FNDA4FaUNMVWy7qQdvZr0/10Qcx4Pd3d2LzWbzpta6xSTHNbIGjs1aQdW9OVn3Vk942YAJOHvWh8PhHSHEbSKq/Y90rQG43d/a+lZn2boQDgSD1Wo1dLvdS67rPvE8Ly9qR1JOecwa1toNAE+63e7q1mAAYzSIIz43N5cXt263K2ZnZ68COAPgLQD9wxC4rntSSvnNcDj8vdfrXZienjbcM3iIUkEYhpicnDRa6/MA7gG4D+D0IfC5h9xXSt0zxpyvVqvP6kthOQEzMUmlUinrzmUANwqSuQPAuRX+aK29EcfxZU6QRmN8d3OCMv+TJMkPWrGnVwB8UpC8vA84z/3Aa7TWV8rewSLHto8nGZDznz/yvdw2AGtcSqy13xXN6Jfiv9c4WwBctNau8wQLYw84K8cIRsBedILXmaQAvFDMcSJ8CK77I0VxpKyPExRNPB+sovRqxBiIs+qL4p2ff9tPzb4EZeP/j+LGgC8dBnTU/gGtbuZryCHV3wAAAABJRU5ErkJggg=="}, "chat": {"image": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAD/UlEQVR4nKWWT4hVVRzHP+fce9+d92ccHGIMCRvUBpEhiAIZikikWoguRVwEbY0W5SIiWoSroIIwWtnGRYTQPyNqIxOBKJIV4qLFJBUyiEjEOON779zzO7/4vblvGGfGNPzCj3sP753v75zv7991U7umSVVCoiBVH0kRIVJjO3AI2AtMdzqdCecceZ7f8N5f6Xa7s8650865qyklVBV7GuzdLG+VI8QsIiJUuSOZg1RtA94FXgA+A04Al8fHx+dDCD6EsC2EMJ1l2QHn3CXg+5TSGyLy1/BkQwduZuZpJCpBIlXVQyUeiTF+CJysnfwz3NTv9ymKgrIsB8+qqsw6IvKmqh5V1VdSSp/ecYMkdiVbCEnldVRfrSW5MiQewohtU6/XG1iWZXjvF4G3VPVrVf3ce/8w8MGKA0FBIxK7hxF5TVVngGtryQ22weC9X1mb5rZOKV2sDzYLzNfSmoOExrAViSekivtF0jV1ywRrYSdeDQu4YRhgVZ1T1QPAWeBH59y8Fx+pYv+4U05K1b8YQyD2AyGst/vEr8DHwPFBxvWratJFOVh4t4Okg8ApnrR8uDvQbDa5T7wP/O6cO55LkMM5nPZ5Y6GSBaoQSM6znM13Ym5ubkOJhpicnBwE3zKvKIovyrI85L24fZ7sWwuU6diPkRAjcQO7HwydNpvNb7z3z+e5+N0ef7nIS2ISqiqQ8OsyR1UH2bJ6vRZWJ+bAfmu1Wj93u93duYs6kZxe93mBVbnFYLWD1diIdDWsG9hNrV7Ksrze6/UmvG0S1JOZ7h7R5RNsZPeCpXG73R7E4fz580lVk4/ozeh0IpkDt6zh3exeWFpaGpCPjIywZcuWrcDfeZWlK+J5KmVupXrtikPomlusKqp1Dqw/DSt78+bNj1uDzCuRWfXsS0m+ao6MENrtdRVrMMKFhQX+C2NjYywuLg5iAexX1bNu1xNPTna7i5fGRjc9Gm4vLYZub5ANQ9JU93fD6OjoXcnXZFcL+LMoij1+59RjfzQajTO9pdtHrbOaPI1Gw4bKSmtuNpuWdoOTDSW6Bw4CF1JKV/MMR4rydqsof4mhdwb4zcgfEPPAhL14n3l2bt9xrSzLYyLyJfDQg7IDF4Ddqtrxznk67TZlWZxqt9ufeO/PAVP/l9HVaVyntLXen1T1mbzITKLEaLvN0q1b74UQboQQztUd8SPAJtYAFpsNYAE1zS3NbegM+/qsqu7NG3mBxEintVyBInIqxvgD8I5lAmAz9jsboY1G4wZg7dKKaBp4EXipJjbNd9Xy2FSz/+3PG86jWY4vEqHXp18Nhot9Hbxcf7YcAY6Zpq1Wy+attdWb9cy2ybUHuFqfehPwbD06nwMe+RfxMnBjzp/yxwAAAABJRU5ErkJggg=="}, "send": {"image": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAABHElEQVR4nOWVQWrCQBSGvww5QHHZha6SjWdouvECIuKmuuoNuvQg3QsiLryASKkgnkGys15AxHVSJs6UOJjJWMzC9ocweXnz/o95DzIeCE5KyCsMw7MYiIAJ0Ac+KFEcx9mq3csUATPgEZgCLcc6J0CkzHsqbgNjV4g4tSYpM+/m2rICOq4Q2wny5p9GzhliA7wrE9M8D2mrfYXyLbmmrVBpDQRWgOd5FxNC2OefJIVzO/ehYom7B/hBkM1oCzRsPRYlMzH04+enaSrXurmjaPiOqv+dGYgr939VDWhUDeD/Ag5A7UaeNeBoAhbAy40Ar8BcB/o+GAJL9T4C9r8wfgAGwBvwrD/qE2yAJ5XYAfL/ce0j62S99JF+mb4BMxY/TBS2FE8AAAAASUVORK5CYII="}, "bookmark": {"image": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAACjElEQVR4nLWVTWsTQRjHf8/sJFRJoamCBy8itBT8ApXSevBQ/AZC8S6IJz14FS9+hd7Ee089GNGLFBTBiz22pUoF+0Kbps1b2+zOyGxm002aNKnWH+zOzs7u//nPM8/OyuNnT9gqlqjVDznc2/hS2t6ebFRhSOcQCQiNBQxGAKtop7Pf4jMwtbKygs5lh8ieCNlgmPVfO5P3Zqbl5o3bHB7UKBTen0pZF2ZgnKsYvbP1m0b5KHZpG0L58JhStszubvHUsbjTBeRT6J/rP7iqhxHrJpyhtFfm+7cPjIxcY3V11T/WXXxsfMz77ZUqgz442MdecSlQBKKpVevxUKm0/1eOO9HuVKnV4gAWRbXq0pW4NlxKgHq91qqI5vXloUUEay1YiyjBmmbrSNpeiKSLoNu4oAPbvEAGE70oOjC+xrvo/vsK+ACuRHtN8zys7W9Bpu9MUDwOiVScz7ZQkbXYVODYSPpln9aE1NcQ67jwultqHG4wLd59Bu0RO7rx+/rIVZEX6jdh2xGwc0bdUA0rmKTc/gPKhPqcveQM14Hnvh0IZfol+pQJ4Ctw37eu3xelxMZfpDuUaj9SzACfgFfAA+Cl788k1dRZUa0AoiJfUD15CCwAc8Abf++t7y/48Rad24x22501SYCma+P7YnkBPLXWurQst0Sabj+KiLv/DrgFvG6YiKzOojMBURRBFOFy0WuXnQceAXfT4h0s+3H33Pzo6Kh2wpVKpWVS2biImjn0znJKqUVgXESmgI1e+fVsKKWmlFLjm5ubi5lMJpfP5wmCwK/B2ZeXgCIw635s5ymncM/N5vP5ojFmyc0gDMNmgEyk4t3UswYU/AKeDCiecBKG4ZwxpqC1XkuM/wEu1Oyu3ZxU3gAAAABJRU5ErkJggg=="}});
SCENE_NATIVE_ICONS.instagram.share=SCENE_NATIVE_ICONS.instagram.send;
SCENE_NATIVE_ICONS.instagram.send={stroke:'M22 3 9.218 10.083M11.698 20.334 22 3H2l7.218 7.083 2.48 10.251Z'};
SCENE_NATIVE_ICONS.x.mail={path:'M1.998 5.5C1.998 4.12 3.117 3 4.498 3h15c1.381 0 2.5 1.12 2.5 2.5v13c0 1.38-1.119 2.5-2.5 2.5h-15c-1.381 0-2.5-1.12-2.5-2.5v-13Zm2.5-.5a.5.5 0 0 0-.5.5v.51l8 5.33 8-5.33V5.5a.5.5 0 0 0-.5-.5h-15Zm15.5 3.41-8 5.33-8-5.33V18.5c0 .28.224.5.5.5h15a.5.5 0 0 0 .5-.5V8.41Z'};
SCENE_NATIVE_ICONS.system.person={path:'M12 12a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9ZM2 23v-1c0-4.8 4.5-7.5 10-7.5s10 2.7 10 7.5v1Z'};
function sceneNativeIcon(type,name,active=false) {
  const group = SCENE_NATIVE_ICONS[type?.startsWith('instagram')?'instagram':type?.startsWith('x-')?'x':type==='kakao-chat'?'kakao':'system'];
  return group?.[name+(active?'Fill':'')] || group?.[name] || SCENE_NATIVE_ICONS.system[name];
}
if(typeof module!=='undefined')module.exports={SCENE_NATIVE_ICONS,sceneNativeIcon};

// Official support handset silhouettes; OS-specific system chrome is shared by preview and export.
const SCENE_SYSTEM_HANDSETS={"galaxy-answer":"M4.857 2.000Q3.429 2.000 2.714 2.714Q2.000 3.429 2.000 7.000Q2.000 10.571 2.714 11.286Q3.429 12.000 3.429 12.714Q3.429 13.429 7.000 17.000Q10.571 20.571 11.286 20.571Q12.000 20.571 12.714 21.286Q13.429 22.000 15.571 22.000Q17.714 22.000 18.429 21.286Q19.143 20.571 19.857 20.571Q20.571 20.571 21.286 19.857Q22.000 19.143 22.000 18.429Q22.000 17.714 20.571 16.286Q19.143 14.857 17.714 14.857Q16.286 14.857 15.571 15.571Q14.857 16.286 13.429 16.286Q12.000 16.286 10.571 14.857Q9.143 13.429 9.143 12.714Q9.143 12.000 7.714 10.571Q6.286 9.143 6.286 8.429Q6.286 7.714 7.000 7.000Q7.714 6.286 8.429 6.286Q9.143 6.286 9.143 5.571Q9.143 4.857 7.714 3.429Q6.286 2.000 4.857 2.000Z","galaxy-decline":"M2.588 13.176Q2.000 13.765 3.176 14.941Q4.353 16.118 4.941 16.118Q5.529 16.118 6.118 15.529Q6.706 14.941 6.706 14.353Q6.706 13.765 7.882 12.588Q9.059 11.412 12.000 11.412Q14.941 11.412 16.118 12.588Q17.294 13.765 17.294 14.353Q17.294 14.941 17.882 15.529Q18.471 16.118 19.059 16.118Q19.647 16.118 20.824 14.941Q22.000 13.765 22.000 13.176Q22.000 12.588 20.235 10.824Q18.471 9.059 17.882 9.059Q17.294 9.059 16.706 8.471Q16.118 7.882 12.000 7.882Q7.882 7.882 7.294 8.471Q6.706 9.059 6.118 9.059Q5.529 9.059 4.353 10.235Q3.176 11.412 3.176 12.000Q3.176 12.588 2.588 13.176Z","ios-answer":"M4.857 2.000Q4.143 2.000 3.429 2.714Q2.714 3.429 2.714 3.786Q2.714 4.143 2.357 4.500Q2.000 4.857 2.000 6.643Q2.000 8.429 2.357 8.786Q2.714 9.143 3.429 10.929Q4.143 12.714 7.714 16.286Q11.286 19.857 11.643 19.857Q12.000 19.857 13.786 20.929Q15.571 22.000 17.714 22.000Q19.857 22.000 20.929 20.929Q22.000 19.857 22.000 19.143Q22.000 18.429 20.929 17.357Q19.857 16.286 19.500 16.286Q19.143 16.286 18.786 15.929Q18.429 15.571 17.357 15.571Q16.286 15.571 15.214 16.286Q14.143 17.000 13.786 17.000Q13.429 17.000 12.714 16.286Q12.000 15.571 11.643 15.571Q11.286 15.571 9.857 14.143Q8.429 12.714 8.429 12.357Q8.429 12.000 7.714 11.286Q7.000 10.571 7.714 9.500Q8.429 8.429 8.429 7.000Q8.429 5.571 8.071 5.214Q7.714 4.857 7.714 4.500Q7.714 4.143 6.643 3.071Q5.571 2.000 4.857 2.000Z","ios-decline":"M3.351 10.649Q2.000 12.000 2.000 13.622Q2.000 15.243 2.270 15.243Q2.541 15.243 2.811 15.514Q3.081 15.784 3.351 15.784Q3.622 15.784 3.892 15.514Q4.162 15.243 5.514 15.243Q6.865 15.243 7.405 14.703Q7.946 14.162 7.946 13.351Q7.946 12.541 8.486 12.000Q9.027 11.459 12.000 11.459Q14.973 11.459 15.514 12.000Q16.054 12.541 16.054 13.351Q16.054 14.162 16.595 14.703Q17.135 15.243 18.216 15.243Q19.297 15.243 19.568 15.514Q19.838 15.784 20.378 15.784Q20.919 15.784 21.189 15.514Q21.459 15.243 21.730 15.243Q22.000 15.243 22.000 13.622Q22.000 12.000 20.919 10.919Q19.838 9.838 19.568 9.838Q19.297 9.838 18.486 9.297Q17.676 8.757 17.135 8.757Q16.595 8.757 16.324 8.486Q16.054 8.216 12.000 8.216Q7.946 8.216 7.676 8.486Q7.405 8.757 6.865 8.757Q6.324 8.757 6.054 9.027Q5.784 9.297 5.243 9.297Q4.703 9.297 3.351 10.649Z"};

function sceneSystemIcon(device,name,size=24){
 const ios=device!=='android',handset=SCENE_SYSTEM_HANDSETS[(ios?'ios':'galaxy')+'-'+(name==='phone-end'?'decline':'answer')];
 const filled={
  phone:handset,'phone-end':handset,
  signal:ios?'M2 14h3v6H2zM7.5 10h3v10h-3zM13 6h3v14h-3zM18.5 2h3v18h-3z':'M3 16h2.4v5H3zM8 12h2.4v9H8zM13 7h2.4v14H13zM18 2h2.4v19H18z',
  wifi:'M12 3C7.5 3 3.8 4.7 1 7.2L3 9.4a13.8 13.8 0 0 1 18 0l2-2.2C20.2 4.7 16.5 3 12 3Zm0 5.4c-3 0-5.8 1-8.1 3l2.2 2.2a9 9 0 0 1 11.8 0l2.2-2.2a12.4 12.4 0 0 0-8.1-3Zm0 5.3c-1.7 0-3.3.6-4.5 1.6L12 20l4.5-4.7a7 7 0 0 0-4.5-1.6Z',
  mail:'M2 4h20v16H2V4Zm1.5 1.5L12 12l8.5-6.5V8L12 14.5 3.5 8V5.5Z',
  camera:'M8 4h8l1.5 3H21a2 2 0 0 1 2 2v11H1V9a2 2 0 0 1 2-2h3.5L8 4Zm4 5a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9Zm0 2a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5Z',
  flashlight:'M8 1h8v4H8zM7 6h10l-3 5v11h-4V11L7 6Zm4 7v4h2v-4z',
  person:'M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10ZM3 23v-2c0-4.5 4-7 9-7s9 2.5 9 7v2Z',
  video:'M3 5h12a2 2 0 0 1 2 2v3l6-4v12l-6-4v3a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z',
  speaker:'M2 9h4l6-5v16l-6-5H2zM15.2 7.8a6 6 0 0 1 0 8.4l1.4 1.4a8 8 0 0 0 0-11.2ZM18.1 4.9a10 10 0 0 1 0 14.2l1.4 1.4a12 12 0 0 0 0-17Z',
 };
 const stroke={
  'call-record':'M3 3h14a2 2 0 0 1 2 2v6 M7 14H3V3 M9 7a3 3 0 1 0 0 6 3 3 0 0 0 0-6 M9 9v2 M14 13h8 M18 13v9 M15 22h6',
  'call-assist':'m8 2 1.8 5.2L15 9l-5.2 1.8L8 16l-1.8-5.2L1 9l5.2-1.8L8 2 M18 11l1.25 3.75L23 16l-3.75 1.25L18 21l-1.25-3.75L13 16l3.75-1.25L18 11',
  lock:'M7 10V7a5 5 0 0 1 10 0v3 M6 10h12v11H6z M12 14v3',
  mic:'M9 4a3 3 0 0 1 6 0v8a3 3 0 0 1-6 0V4 M5 10v2a7 7 0 0 0 14 0v-2 M12 19v4 M8 23h8',
  'mic-off':'m3 2 18 20 M9 6V4a3 3 0 0 1 6 0v8 M9 11v1a3 3 0 0 0 4 2.8 M5 10v2a7 7 0 0 0 12 5 M19 10v2 M12 19v4 M8 23h8',
  bluetooth:'m7 6 10 12-5 4V2l5 4L7 18',plus:'M12 3v18 M3 12h18',
  fingerprint:'M5 8a8 8 0 0 1 14 0 M3 12v2m18-2v2 M7 11a5 5 0 0 1 10 0v3c0 5-1 7-3 9 M10 11a2 2 0 0 1 4 0v4c0 4-1 6-2 8 M7 14v2c0 3-1 5-3 7 M10 15c0 4-1 6-2 8 M20 17c0 2-1 4-2 6',
  message:'M3 4h18v13H9l-5 4v-4H3z',clock:'M12 7v6l4 2 M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0',
  chevron:'m7 4 8 8-8 8',back:'m15 4-8 8 8 8',recents:'M6 5v14 M12 5v14 M18 5v14',home:'M8 5h8a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z'
 };
 let body;
 if(name==='keypad')body=Array.from({length:9},(_,i)=>'<circle cx="'+(5+i%3*7)+'" cy="'+(5+Math.floor(i/3)*7)+'" r="2.1"/>').join('');
 else if(name==='more')body='<circle cx="4" cy="12" r="2.2"/><circle cx="12" cy="12" r="2.2"/><circle cx="20" cy="12" r="2.2"/>';
 else if(name==='record')body='<circle cx="12" cy="12" r="5"/>';
 else body='<path fill-rule="evenodd" d="'+(filled[name]||stroke[name]||stroke.message)+'"/>';
 return'<svg class="sys-icon sys-'+name+'" data-system-icon="'+(ios?'ios':'oneui')+':'+name+'" data-icon-render="'+(stroke[name]?'stroke':'fill')+'" width="'+size+'" height="'+size+'" viewBox="0 0 24 24" aria-hidden="true" fill="'+(stroke[name]?'none':'currentColor')+'" stroke="'+(stroke[name]?'currentColor':'none')+'" stroke-width="'+(ios?'1.9':'1.7')+'" stroke-linecap="round" stroke-linejoin="round">'+body+'</svg>';
}
function sceneSystemStatus(p,timeMarkup){
 const android=p.device==='android';
 const battery=android?'<span class="sys-battery-galaxy"><b>100</b></span>':'<svg class="sys-battery-ios" viewBox="0 0 29 14" aria-hidden="true"><rect x=".7" y="1" width="24" height="12" rx="3" fill="none" stroke="currentColor" stroke-opacity=".5"/><rect x="2.5" y="2.7" width="20.4" height="8.6" rx="1.8" fill="currentColor"/><path d="M26 4.5v5a2.6 2.6 0 0 0 0-5Z" fill="currentColor" opacity=".6"/></svg>';
 return'<div class="ph-status '+(android?'sys-oneui':'sys-ios')+'"><span class="ph-status-clock">'+timeMarkup+'</span><span class="ph-system" aria-hidden="true">'+sceneSystemIcon(p.device,'signal',18)+sceneSystemIcon(p.device,'wifi',18)+battery+'</span></div>';
}
function sceneSystemHome(p){
 if((p.device==='android'?p.androidNavigation:p.iphoneNavigation)==='none')return '';
 return p.device==='android'&&p.androidNavigation==='buttons'?'<div class="ph-android-navigation sys-oneui-nav" aria-hidden="true">'+sceneSystemIcon('android','recents')+sceneSystemIcon('android','home')+sceneSystemIcon('android','back')+'</div>':'<div class="ph-home-indicator" aria-hidden="true"></div>';
}

function scenePaintSystemIconOriginal(ctx,device,name,x,y,size,color){
 const markup=sceneSystemIcon(device,name),stroke=/fill="none"/.test(markup);
 ctx.save();ctx.translate(x,y);ctx.scale(size/24,size/24);ctx.fillStyle=ctx.strokeStyle=color;ctx.lineWidth=device==='android'?1.7:1.9;ctx.lineCap=ctx.lineJoin='round';
 for(const match of markup.matchAll(/<path[^>]*d="([^"]+)"/g)){const path=new Path2D(match[1]);if(stroke)ctx.stroke(path);else ctx.fill(path,'evenodd')}
 ctx.restore();
}
function scenePaintSystemIcon(ctx,device,name,x,y,size,color){
 if(typeof ElementRender==='undefined')return scenePaintSystemIconOriginal(ctx,device,name,x,y,size,color);
 return ElementRender.paint(ctx,'icon','system:'+name+':'+x+','+y,{x,y,width:size,height:size},name,edit=>scenePaintSystemIconOriginal(ctx,device,name,x,y,size,edit.color||color));
}
function scenePaintSystemStatus(ctx,p,width,color,background){
 ctx.save();ctx.fillStyle=color;ctx.textAlign='left';ctx.font='600 13px '+(p.device==='android'?'SceneRoboto,SceneKorean':'SceneInter,Scene')+',Arial,sans-serif';ctx.fillText(p.clock,24,23);
 scenePaintSystemIcon(ctx,p.device,'signal',width-87,10,17,color);scenePaintSystemIcon(ctx,p.device,'wifi',width-66,10,17,color);
 ctx.beginPath();ctx.roundRect(width-42,12,28,13,p.device==='android'?7:3);ctx.fill();
 if(p.device==='android'){ctx.fillStyle=background;ctx.font='700 8px SceneRoboto,Arial';ctx.textAlign='center';ctx.fillText('100',width-28,21.4)}else{ctx.globalAlpha=.5;ctx.beginPath();ctx.roundRect(width-12,16,2,5,1);ctx.fill()}
 ctx.restore();
}
function scenePaintSystemHome(ctx,p,width,height,color){
 if((p.device==='android'?p.androidNavigation:p.iphoneNavigation)==='none')return;
 if(p.device==='android'&&p.androidNavigation==='buttons'){
  for(const[name,x]of [['recents',width/6],['home',width/2],['back',width*5/6]])scenePaintSystemIcon(ctx,p.device,name,x-9,height-24,18,color);
 }else{ctx.save();ctx.fillStyle=color;const w=p.device==='android'?108:128;ctx.beginPath();ctx.roundRect((width-w)/2,height-12,w,4,2);ctx.fill();ctx.restore()}
}
if(typeof module!=='undefined')Object.assign(module.exports,{sceneSystemIcon,sceneSystemStatus,sceneSystemHome,SCENE_SYSTEM_HANDSETS});
