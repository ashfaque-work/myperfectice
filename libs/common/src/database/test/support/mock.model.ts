// export abstract class MockModel<T> {
//     protected abstract entityStub: T;
  
//     constructor(createEntityData: T) {
//       this.constructorSpy(createEntityData);
//     }
  
//     constructorSpy(_createEntityData: T): void {}
  
//     async findOne(request: any): Promise<T> {      
//       return this.entityStub
//     }
  
//     async find({}): Promise<T[]> {
//       return [this.entityStub]
//     }
  
//     async save(): Promise<T> {
//       return this.entityStub;
//     }
  
//     async findOneAndUpdate(id: any, data: any, opt:any): Promise<T> {
//       return this.entityStub;
//     }
//   }