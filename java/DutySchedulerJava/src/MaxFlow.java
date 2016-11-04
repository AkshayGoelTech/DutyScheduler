import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Deque;

public class MaxFlow {
	
	public static class Node {		
		public Node() {};
		ArrayList<Edge> edges= new ArrayList<>();
		int index;
		boolean active;
		int minCapacity;
		int arrIndex; //To retrieve its position in array in O(1)
	}
	
	public static class Edge {
		boolean forward;
		Node from, to;
		int flow, capacity;
		Edge dual;
		
		protected Edge(Node s, Node e, int c, boolean f) {
			from = s; to = e; capacity = c;	forward = f;
		}
		
		public int remaining() {
			return capacity - flow;
		}
		
		public void addFlow(int amount) {
			flow+=amount;
			dual.flow -=amount;
		}
	}
	
	public static abstract class MaxFlowSolver {
		ArrayList<Node> nodes = new ArrayList<>();
		Node[] RAs; //To know which Nodes are RAs and retrieve index by RA Name.
		Node[] days; //To know which Nodes are days
		
		public abstract int getMaxFlow(Node src, Node snk);
		
		public void link(Node n1, Node n2, int capacity) {
			Edge e12 = new Edge(n1, n2, capacity, true);
			Edge e21 = new Edge(n2, n1, 0, false); //opposite edge has zero capacity.
			e12.dual = e21;
			e21.dual = e12;
			n1.edges.add(e12);
			n2.edges.add(e21);
		}
		
		protected MaxFlowSolver(int raCount, int dayCount) {
			RAs = new Node[raCount]; //Stored in memory by indexing from 0
			days = new Node[dayCount]; //Stored in memory by indexing from 0
			Arrays.fill(RAs, null);
			Arrays.fill(days, null);
		}
		
		/*
		 * Method to create a Link with capacity 1 between RA[i] to each Day[j] 
		 * that RA is available.
		 * 
		 * - i is the index of RA
		 * - availDays[] is an array of days this RA is available
		 */
		public void linkRaToDays(int i, String[] availDays) {
			Node node = addNode();
			RAs[i] = node;
			node.arrIndex = i;
			
			for (int x = 0; x < availDays.length; x++) {
				int j = Integer.parseInt(availDays[x]);
				//Using j-1 because Day 1 is indexed at 0, Day 2 is indexed at 1,
				// Day n is indexed at n-1 ...
				if (days[j-1] == null) {
					Node n = addNode();
					days[j-1] = n;
					n.arrIndex = j-1;
				}
				link(RAs[i], days[j-1], 1);				
			}
		}
		
		//Create new Node
		public Node addNode() {
			Node node = new Node();
			node.index = nodes.size();
			nodes.add(node);
			return node;
		}
		
		/*
		 * Method to create links between src and every RA.
		 * And, create links between every Day and snk.
		 * 
		 * If links already exist, the capacity is updated.
		 */
		public void linkSinkSrc(int k, Node src, Node sink) {
			for (int i = 0; i < RAs.length; i++) {
				link(src, RAs[i], k);
			}
			for (int j = 0; j < days.length; j++) {
				link(days[j], sink, 2);
			}
		}
		
		/*
		 * Method to output 2 things:
		 * 1) A Map of RA name to days assigned
		 * 2) A Map of Day to RA assigned on that day
		 * 
		 * Note that this will not be expected as output for programming team question.
		 * The purpose of this method is to see the results visually to help SRA.
		 */
		public void showDaysAssigned(ArrayList<String> raList) {
			//Outputs List of days for each RA
			for (int i = 0; i < RAs.length; i++) {
				Node currRA = RAs[i];
				System.out.print(raList.get(currRA.arrIndex));
				for (Edge edge : currRA.edges) {
					if (edge.flow == 1 && edge.forward) {
						int dayIndex = edge.to.arrIndex;
						System.out.print(" " + (dayIndex + 1));
					}
				}
				System.out.println();
			}
			System.out.println();
			
			//Outputs list of RAs for each day
			for (int i = 0; i < days.length; i++) {
				Node currDay = days[i];
				System.out.print("Day " + (i+1) + ": ");
				for (Edge edge : currDay.edges) {
					if (edge.dual.flow == 1) {
						int raIndex = edge.to.arrIndex;
						System.out.print(raList.get(raIndex) + " ");						
					}
				}
				System.out.println();
			}
		}
	}
	
	//Ford Fulkerson algorithm adapted from VT Programming Team Handbook
	static class FordFulkerson extends MaxFlowSolver {

		FordFulkerson(int nRAs, int nDays) { super(nRAs, nDays);}
		
		@Override
		public int getMaxFlow(Node src, Node snk) {
			int total = 0;
			
			for (;;) {
				Edge[] prev = new Edge[nodes.size()];
				int addedFlow = findAugPath(src, snk, prev);
				if (addedFlow == 0) 
					break;
				total += addedFlow;
				
				for (Edge edge = prev[snk.index]; edge != null; edge = prev[edge.dual.to.index]) {
					edge.addFlow(addedFlow);
				}
			}
			return total;					
		}
		
		int findAugPath(Node src, Node snk, Edge[] from) {
			Deque<Node> queue = new ArrayDeque<>();
			queue.offer(src);
			
			int N = nodes.size();
			src.minCapacity = Integer.MAX_VALUE;
			for (Node u : nodes)
				u.active = false;
			src.active = true;
			
			while (queue.size() > 0) {
				Node node = queue.poll();
				if (node == snk)
					return snk.minCapacity;
				for (Edge edge : node.edges) {
					Node dest = edge.to;
					if (edge.remaining() > 0 && !dest.active) {
						dest.active = true;
						from[dest.index] = edge;
						dest.minCapacity = Math.min(node.minCapacity, edge.remaining());
						
						if (dest == snk)
							return snk.minCapacity;
						queue.push(dest);
					}
				}
			}
			return 0;
		}
		
	}
}