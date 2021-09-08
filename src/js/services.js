export default class Services {

    constructor() {
        this._apibase = 'http://localhost:3000';
    }

    getResource = async (url) => {
        const res = await fetch(`${this._apibase}${url}`);
        
        if(!res.ok) {
            throw new Error(`Coul not fetch ${url}, received ${res.status}`);
        }
    
        return await res.json();
    }
    
    getUsers = async () => {
        const users = await this.getResource(`/users`);
        return users
    }
    
    getTasks = async () => {
        const tasks = await this.getResource('/tasks');
        return tasks
    }
    
}