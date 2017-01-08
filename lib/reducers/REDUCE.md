To achieve the current process of rendering the different pane as split we need a different approach.
The object structure is as follow
```
Tabs
  Tab
    active : Pane => uid
  active: Tab => uid
```

Since a Tab can open pane we need a way do define which pane are to which Tab
```
  Tab
    first: Pane
```

We now have the first pane of the Tab we can call this the Root.
Now when we open a new Pane by splitting the view we need a way to keep this in order

Introducing the Panes
```
Panes
  split : VERTICAL || HORIZONTAL
  subs: []
```

What happen if we introduce the Panes as a sub of The first we get
```
  Pane
    layout: [0]
```

Now the pane have Panes but where is the child?
```
  Pane
    layout: [0 => new Panes]
```

We now have a state like
```
Tabs
  Tab
    first: Pane 
      =>
      layout [
        0 => Panes
          split : VERTICAL || HORIZONTAL
          subs: [
            => Pane
          ]
      ]
    active : Pane => uid
  active: Tab => uid
```

   
