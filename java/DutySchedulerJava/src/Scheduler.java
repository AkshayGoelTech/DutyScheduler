import java.util.ArrayList;
import java.util.Scanner;


public class Scheduler {

	static Scanner scanner = new Scanner(System.in);
	
	public static void main(String[] args) {
		
		int nRAs = scanner.nextInt(); //Start is 1
		int nDays = scanner.nextInt(); //Start is 1
		scanner.nextLine();
		
		String input[] = new String[nRAs];
		for (int i = 0; i < nRAs; i++) {
			input[i] = scanner.nextLine();
		}
		
		for (int k = 1; k < 2*nRAs; k++) {
			ArrayList<String> raList = new ArrayList<>();
			MaxFlow.MaxFlowSolver solver = new MaxFlow.FordFulkerson(nRAs, nDays);
			MaxFlow.Node src = solver.addNode();
			MaxFlow.Node snk = solver.addNode();
			
			for (int i = 0; i < input.length; i++) {
				String[] line = input[i].split("\\s+", 2);
				String ra = line[0];
				raList.add(ra); //RAs numbered from 0
				String[] days = line[1].split("\\s+");
				
				//Create links between RA[i] and day[j]
				solver.linkRaToDays(raList.size()-1, days);			
				
			}
			
			solver.linkSinkSrc(k, src, snk);
			int flow = solver.getMaxFlow(src, snk);
			if (flow == 2*nDays) {				
				//Output
				solver.showDaysAssigned(raList);
				break;
			}
		}
		
	}

}



