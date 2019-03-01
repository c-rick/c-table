## simpale loop table

required jq
### how to use? 
```
<link rel="stylesheet" href="c-table.css">
<script src="./c-table.js"></script>
grid = new Table(options)
grid.renderData(localDate)
```
### options
| name        | type    |  required  | defind  |
| --------   | -----:   | -----:  | :----: |
| col        | Array      |   true    | 列定义    |
| selector        | string      |   true    |  表格填充元素    |
| autoshow        | boolean      |   false    | 是否打开子表格    |
| subKey        | string      |   false    | 子数据对应的key    |
| filterObj        | Object      |   false    | 对应级列表的过滤器    |
| defaultFilter        | Function      |   true    | 默认过滤器    |

### example like demo

[img1](https://c-rick.github.io/images/c-table.png)

