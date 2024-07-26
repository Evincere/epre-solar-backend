export class FlujoEnergia {
    
    constructor(private readonly autoconsumida: number, private readonly inyectada: number, private readonly year: number){}

    public getAutoconsumida(): number {
        return this.autoconsumida;
    }
    public getInyectada(): number {
        return this.inyectada;
    }
    public getYear(): number {
        return this.year;
    }

}
