interface ITodo {
  id: string,
  title: string,
  completed: boolean,
  priority: 'low' | 'medium' | 'high'
}

interface ITodoItemProps {
  key : string,
  todo : ITodo;
  editing? : boolean;
  onSave: (val: any) => void;
  onDestroy: () => void;
  onEdit: ()  => void;
  onCancel: (event : any) => void;
  onToggle: () => void;
  onPriorityChange: (priority: 'low' | 'medium' | 'high') => void;
}

interface ITodoItemState {
  editText : string
}

interface ITodoFooterProps {
  completedCount : number;
  onClearCompleted : any;
  nowShowing? : string;
  count : number;
}


interface ITodoModel {
  key : any;
  todos : Array<ITodo>;
  onChanges : Array<any>;
  subscribe(onChange);
  inform();
  addTodo(title : string, priority: 'low' | 'medium' | 'high');
  toggleAll(checked);
  toggle(todoToToggle);
  destroy(todo);
  save(todoToSave, text);
  updatePriority(todoToUpdate: ITodo, priority: 'low' | 'medium' | 'high');
  clearCompleted();
}

interface IAppProps {
  model : ITodoModel;
}

interface IAppState {
  editing? : string | null;
  nowShowing? : string;
  newTodoPriority? : 'low' | 'medium' | 'high'
}
