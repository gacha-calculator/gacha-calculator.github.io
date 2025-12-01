function p(e){let s=!0;for(let t=0;t<e.length-1;t++){let f=!0;for(const l of e[t].states)l>0&&(f=!1,s=!1);e[t].isEmpty=f}return s}export{p as checkIsEmpty};
