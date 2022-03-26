import React from "react";
// import { Link } from "react-router-dom";
// import { renderRoutes } from "react-router-config";
import '@/css/App.css'
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import Home from '@/pages/Home'
import Default from '@/pages/DefaultPage'
import ctx from "@/config/context.js"

// function App(props) {
//     console.log(props.route)
// 	return (
// 		<div className="App">
// 			<ctx.Provider value={{jiang: 'xinyu'}}>
//                 <Router >
//                     <Switch>
//                         <Route path="/" exact component={Home}></Route>
//                         <Route path="/default" component={Default}></Route>
//                     </Switch>
//                 </Router>
//             </ctx.Provider>
// 		</div>
// 	);
// }


export default class App extends React.Component {
    // constructor(props) {
    //     super(props)
    // }
    render() {
        return (
            <div className="App">
                <ctx.Provider value={{jiang: 'xinyu'}}>
                    <Router>
                        <Switch>
                            <Route path="/" exact component={Home}></Route>
                            <Route path="/default" component={Default}></Route>
                        </Switch>
                    </Router>
                </ctx.Provider>
            </div>
        )
    }
}



// export default App;
