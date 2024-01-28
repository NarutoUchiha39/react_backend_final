import {useState,useEffect} from 'react'
import { flexRender, useReactTable,getCoreRowModel,getPaginationRowModel } from '@tanstack/react-table'
import '../css/GuestEntries.css'
import columns from './columns'


export default function Table() {
    let [guests,set_guests] = useState({array:[]})

    useEffect(()=>{

        // eslint-disable-next-line no-unused-vars
     

        async function fetchGuest(){

            let res =  await fetch('https://hostedwebsitebackend.onrender.com/logs/getGuestUsers',{
                headers:{"Content-Type":"application/json"},
                method:"GET"
            }).then((res)=>{
                return res.json()
            })
            
            let names = []
            let number = []
            for (let index = 0; index < res.length; index++) {
                

                names.push(res[index].name)
                number.push(res[index].number)
            }
            
            set_guests((state)=>(
                {
                   ...state,array:res
                }
            ))

     

           
        }

        fetchGuest()
    },[])

    const tableInstance = useReactTable({
        columns:columns,
        data:guests.array,
        getCoreRowModel:getCoreRowModel(),
        getPaginationRowModel:getPaginationRowModel(),
    })

  
    tableInstance.options.state.pagination.pageSize = 6
  return (
    <>
    <div className="oo">
    <table>
        <thead>
            {tableInstance.getHeaderGroups().map((headerEL)=>{
                return <tr key={headerEL.id}>
                    {
                        headerEL.headers.map(columnEL=>{
                            return <th key={columnEL.id} colSpan={columnEL.col}>
                                {
                                    flexRender(
                                        columnEL.column.columnDef.header,
                                        columnEL.getContext()
                                    )
                                }
                            </th>
                        })
                    }
                </tr>
            })}
        </thead>
        <tbody>
            {
                tableInstance.getRowModel().rows.map((rowEL)=>{
                    return( <tr key={rowEL.id}>
                        {
                            rowEL.getVisibleCells().map(cellEL=>{
                                return( <td key={cellEL.id}>
                                    {
                                      flexRender (cellEL.column.columnDef.cell,
                                        cellEL.getContext()
                                      )
                                    }
                                </td>
                            )})
                        }
                    </tr>
                )   })
            }
        </tbody>
    </table>
      <div style={{display:'flex',position:'relative',top:'60%',marginBottom:'5%',justifyContent:'space-evenly',width:'100%'}}>
        <div className="prev">
                <button
                onClick={() => tableInstance.setPageIndex(0)}
                disabled={!tableInstance.getCanPreviousPage()}
                >
                {"<<"}
                </button>
                <button
                onClick={() => tableInstance.previousPage()}
                disabled={!tableInstance.getCanPreviousPage()}
                >
                Previous Page
                </button>
        </div>

        <div className="next">
                <button
                onClick={() => tableInstance.nextPage()}
                disabled={!tableInstance.getCanNextPage()}
                >
                Next Page
                </button>
                <button
                onClick={() =>
                    tableInstance.setPageIndex(tableInstance.getPageCount() - 1)
                }
                disabled={!tableInstance.getCanNextPage()}
                >
                {">>"}
                </button>
        </div>
        
        
      </div>
            {/* <div className="details">
                    <ul>
                        <li>
                        You are on page number:{" "}
                        {tableInstance.options.state.pagination.pageIndex}
                        </li>
                        <li>Total pages: {tableInstance.getPageCount() - 1}</li>
                    </ul>
                    <input
                        type="number"
                        defaultValue={tableInstance.options.state.pagination.pageIndex}
                        onChange={(e) => tableInstance.setPageIndex(e.target.value)}
                    />
                    <hr />
            </div> */}
      
    </div>

    </>
  )
}
