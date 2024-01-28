/* eslint-disable no-unused-vars */
import { useEffect } from 'react';
import '../css/Home.css'
import { Line } from 'react-chartjs-2';
import PropTypes from 'prop-types';
import { Chart as ChartJS, ArcElement, Tooltip, Legend,CategoryScale,LinearScale,PointElement,LineElement } from "chart.js";
import { useRef } from 'react';
import { useState } from 'react';

function Home(props)
{
    let count = false;
    
    ChartJS.register(ArcElement, Tooltip, Legend,CategoryScale,LinearScale,PointElement,LineElement);

    // const[Days,set_days] = useState([])
    // const[values,set_values] = useState([])
    // const[height1,set_height]  = useState(0)
    // const[width1,set_width1]  = useState(0)

    const [graph_state,set_graph_state] = useState({
        Days:[],
        values:[],
        height1:0,
        width1:0
    })
    
    useEffect(()=>{
        let padding = 50
        async function getDate(){
        let new_res = []
        let result = await fetch('http://localhost:3000/dates/getDates',{
            headers:{"Content-Type":"application/json"},
            method:"GET",
        }).then(async(result)=>{
                    return await result.json()
                }
            )

        result.result.forEach((element)=>{
            new_res.push({Day:element.date,in:element.in})
        })
        let height = document.getElementById("graphs").clientHeight
        let width = document.getElementById("graphs").clientWidth
        let Days = new_res.map((element)=>element.Day)
        let values = new_res.map((element)=>element.in)

        set_graph_state((state)=>({...state,Days:Days,height1:height,width1:width,values:values}))
    }
    getDate()
    
    },[props.counts.in])

    

    return(
        <>
            <div className="home">
                <div className="cards">
                
                    <div className="card">
                        <div className="cell-card in">
                            <div className="info1">   
                                <div className="image1"><i className="fa-solid fa-right-to-bracket" style={{fontSize:"50px",marginLeft:"19%"}}></i></div>
                                <div className="data">
                                    <b style={{fontSize:"30px"}}>{props.counts.in}</b>
                                </div>
                            </div>

                            <div className="label1">
                                Total Entries
                            </div>

                        </div>
                        <div className="cell-card out">
                                <div className="info1">
                                    <div className="image1"><i className="fa-solid fa-right-from-bracket" style={{fontSize:"50px",marginLeft:"19%"}}></i></div>
                                    <div className="data">
                                        <b style={{fontSize:"30px"}}>{props.counts.out}</b>
                                    </div>
                                </div>
                                <div className="label1">
                                    Total Exits
                                </div>
                        </div>
                        <div className="cell-card occupancy-ratio">
                            <div className="info1">
                                <div className="image1"><i className="fa-solid fa-percent" style={{fontSize:"50px",marginLeft:"19%"}}></i></div>
                                <div className="data">
                                    <b style={{fontSize:"30px"}}>{props.counts.out}</b>
                                </div>
                        
                            </div>

                            <div className="label1">
                                Occupancy Ratio
                            </div>
                        </div>
                        <div className="cell-card todo"></div>
                    </div>
                    <div className="card">
                    <div className="cell-card in">
                        <div className="info1">
                            <div className="image1"><i className="fa-solid fa-book-open-reader" style={{fontSize:"50px",marginLeft:"19%"}}></i></div>
                            <div className="data">
                                <b style={{fontSize:"30px"}}>{props.counts.out}</b>
                            </div>
                        </div>
                        <div className="label1">
                            Student Entries
                        </div>
                    </div>
                        <div className="cell-card out">
                            <div className="info1">
                                    <div className="image1"><i className="fas fa-chalkboard-teacher" style={{fontSize:"50px",marginLeft:"19%"}}></i></div>
                                    <div className="data">
                                        <b style={{fontSize:"30px"}}>{props.counts.out}</b>
                                    </div>
                            </div>
                            <div className="label1">
                                Faculty Entries
                            </div>
                        </div>
                        <div className="cell-card occupancy-ratio">
                            <div className="info1">
                                <div className="image1"><i className="fa-solid fa-user" style={{fontSize:"50px",marginLeft:"19%"}}></i></div>
                                    <div className="data">
                                        <b style={{fontSize:"30px"}}></b>
                                    </div>
                            </div>

                            <div className="label1">
                                Unknown Entries
                            </div>
                        </div>
                        <div className="cell-card todo">{graph_state.width1}</div>
                    </div>

                    <div className="busy" style={{color:"#fff"}}>
                        <div className="title">
                            <p >Busiest Hour </p>
                        </div>
                        <div className="graph" style={{display:'flex',justifyContent:'center',alignItems:'center',fontSize:'50px'}}>
                        <i className="fa-solid fa-clock"></i>
                        </div>
                        <div className="hour">
                            <p>10:00 AM</p>
                        </div>
                    </div>
                    <div className="busy2" style={{color:"#fff"}}>
                    <div className="title">
                            <p >Busiest Day </p>
                        </div>
                        
                        <div className="graph" style={{display:'flex',justifyContent:'center',alignItems:'center',fontSize:'50px'}}>
                            <i className="fa-solid fa-calendar-days"></i> 
                        </div>

                        <div className="hour">
                            <p>{props.counts.busiest_day}</p>
                        </div>
                    </div>
                              
                </div>
                <div className="graphs" id="graphs">
                <Line
                    datasetIdKey='id'
                    width={graph_state.width1}
                    height={graph_state.height1}
                    data={{
                        labels:graph_state.Days,
                        datasets: [
                        {
                            id: 1,
                            label: 'Number of entries',
                            data: graph_state.values,
                            borderColor: '#36A2EB',
                            backgroundColor: '#9BD0F5',
                            
                        }
                        
                        ],
                    }}
                />
                </div>

            </div>
    
        
        </>
    )
}

Home.propTypes = {
    counts : PropTypes.object,
    counts_face : PropTypes.object
}
export default Home
