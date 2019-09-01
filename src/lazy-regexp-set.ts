interface regPiece{
    length: number;
}
class Group implements regPiece{ // ( )
    childs: any[];
    constructor(childs: any[] = []){
        this.childs = childs;
    }
}
class Charset implements regPiece{ // [ ]
    childs: any[];
    constructor(childs: any[] = []){
        this.childs = childs;
    }
    get length(): number{
        var length: number = 0;
        this.childs.forEach(value => {
            length += value.length;
        });
        return length;
    }
}
class Quantifier implements regPiece{ // { }
    childs: any[];
    constructor(childs: any[] = []){
        this.childs = childs;
    }
}

class regSet implements Set<string>{
    regExp: RegExp;
    private added: Set<any>;
    private deleted: Set<string>;
    constructor(regExp: RegExp | string){
        this.regExp = new RegExp(`^${regExp}$`);
    }
    add(value){
        if(this.regExp.test(value)){
            this.added.add(value);
        }
        return this;
    }
    clear(){
        this.regExp = new RegExp("");
        this.added.clear();
        this.deleted.clear();
    }
    delete(value){
        if(this.added.has(value)){
            return this.added.delete(value);
        }else if(this.regExp.test(value)){
            this.deleted.add(value);
            return true;
        }else{
            return false;
        }
    }
    entries(){
        return this.added.entries();
    }
    forEach(callback, thisArg?){
        return this.added.forEach(callback, thisArg);
    }
    has(value){
        return !this.deleted.has(value) && this.regExp.test(value) || this.added.has(value);
    }
    *values(){

    }
    keys(){
        return this.values();
    }
    get size(): number{
        return 0;
    }
    parse(regExp: string = /\/\^(.*)\$\//.exec(this.regExp.toString())[1]){
        const bPair = {
            "[": {close: "]", class: Charset}, 
            "(": {close: ")", class: Group}, 
            "{": {close: "}", class: Quantifier}
        };
        let result: (Group | Charset | Quantifier | string)[] = [];
        let bOpen: number;
        let bClose: number;
        let bType: "[" | "(" | "{";
        let openedb: number = 0;
        [...regExp.toString()].forEach((value, index) => {
            let openInfo = /\[|\(|\{/.exec(value);
            let closeInfo = /[\]\)}]/.exec(value);
            if(openInfo){
                if(bOpen == undefined){
                    bOpen = index;
                    bType = openInfo.input as "[" | "(" | "{";
                }
                openedb++;
            }else if(closeInfo){
                if(openedb == 1 && bPair[bType].close == closeInfo.input){
                    result.push(new bPair[bType].class(this.parse(regExp.substring(bOpen + 1, index))));
                    bClose = index;
                    bOpen = undefined;
                }   
                openedb--;
            }
        });
        if(bClose && regExp.substring(bClose + 1)){
            result.push(regExp.substring(bClose + 1));
        }else if(!result.length){
            result.push(regExp);
        }
        return result;
    }
}

//console.log(new Set("abcd"))

console.log(new regSet("([(abc)cx][def])ab").parse());
